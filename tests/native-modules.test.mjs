import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { ModuleRegistry, orderModules, reference } from '../native/modules/registry.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));

test('module dependency ordering preserves FIFO discovery and enabled optional edges', () => {
  const modules = orderModules([
    { name: 'first', dependencies: ['late'] },
    { name: 'second' },
    { name: 'late' },
    { name: 'third', optionalDependencies: ['first', 'disabled', 'absent'] },
    { name: 'disabled', enabled: false, dependencies: ['absent'] },
  ]);
  assert.deepEqual(modules.map(module => module.name), ['second', 'late', 'first', 'third']);
  assert.throws(() => orderModules([{ name: 'a', dependencies: ['missing'] }]), /Missing dependency/);
  assert.throws(() => orderModules([{ name: 'a', dependencies: ['b'] }, { name: 'b', optionalDependencies: ['a'] }]), /cycle/);
  assert.throws(() => orderModules([{ name: 'a', conflicts: ['b'] }, { name: 'b' }]), /conflict/);
  assert.throws(() => orderModules([{ name: 'a' }, { name: 'A' }]), /Duplicate module/);
  assert.throws(() => orderModules([{ name: 'a', functions: { work() {} } }, { name: 'b', functions: { work() {} } }]), /Undeclared override/);
  assert.throws(() => orderModules([{ name: 'a', functions: { init() {} } }]), /initialize/);
});

function dispatchDefinitions() {
  return [
    { name: 'base', state: () => ({ trace: [] }), functions: {
      action(ctx, count, box) {
        ctx.state().trace.push(`b${count}`);
        box.value++;
        return count ? ctx.call('base', 'action', count - 1, box) : 1;
      },
      helper(ctx, count, box) { return ctx.call('base', 'action', count, box); },
      bottom(ctx) { return ctx.next(); },
    } },
    { name: 'middle', dependencies: ['base'], functions: {
      action(ctx, count, box) {
        ctx.state('base').trace.push(`m${count}`);
        return ctx.call('base', 'action', count, box) + 10;
      },
    } },
    { name: 'top', dependencies: ['middle'], functions: {
      action(ctx, count, box) {
        ctx.state('base').trace.push(`t${count}`);
        return ctx.next(count, box) + 100;
      },
      helper(ctx, count, box) { return ctx.next(count, box); },
    }, optionalDependencies: ['base'] },
  ];
}

test('calls from every namespace dispatch through the full chain; recursion restarts it', async () => {
  const session = await new ModuleRegistry(dispatchDefinitions()).createSession();
  for (const name of ['base', 'middle', 'top']) {
    const box = { value: 0 };
    session.state('base').trace = [];
    assert.equal(session.call(name.toUpperCase(), 'ACTION', 2, box), 331);
    assert.equal(box.value, 3);
    assert.deepEqual(session.state('base').trace, ['t2', 'm2', 'b2', 't1', 'm1', 'b1', 't0', 'm0', 'b0']);
  }
  assert.deepEqual(session.chain('action'), ['base', 'middle', 'top']);
  assert.equal(session.call('base', 'bottom'), null);
  assert.throws(() => session.call('missing', 'action'), /not initialized/);
  assert.throws(() => session.call('base', 'missing'), /Undefined module function/);
});

test('only the immediate overriding function can enter a lower implementation directly', async () => {
  const events = [];
  const session = await new ModuleRegistry([
    { name: 'base', functions: { work(ctx, redirected) { events.push('base'); return redirected; } } },
    { name: 'middle', dependencies: ['base'], functions: { work(ctx, redirected) { events.push('middle'); return ctx.next(redirected); } } },
    { name: 'top', dependencies: ['middle'], functions: {
      work(ctx, redirected = false) {
        events.push('top');
        return redirected ? ctx.next(redirected) : ctx.call('base', 'work', true);
      },
    } },
  ]).createSession();
  assert.equal(session.call('base', 'work'), true);
  assert.deepEqual(events, ['top', 'top', 'middle', 'base']);
});

test('module initialization and import aliases preserve ordering, input isset, and request isolation', async () => {
  const events = [];
  const registry = new ModuleRegistry([
    { name: 'input', state: () => ({ zero: 20, empty: 30, nil: 40, untouched: 50 }), initialize(ctx) { events.push(ctx.moduleName); } },
    { name: 'base', dependencies: ['input'], state: () => ({ value: 1, nested: { count: 0 }, ___PRIVATE_hidden: 7 }),
      initialize(ctx) {
        events.push(ctx.moduleName);
        ctx.state().value += ctx.state('input').zero;
        ctx.state().fromInit = ctx.call('base', 'early');
        assert.throws(() => ctx.state('later'), /not initialized/);
      }, functions: { early() { return 5; }, change(ctx, slot) { slot.value++; } } },
    { name: 'later', dependencies: ['base'], initialize(ctx) { ctx.reference('base', 'value').value++; } },
  ]);
  const one = await registry.createSession();
  const two = await registry.createSession({ states: { input: { zero: 2 } } });
  assert.deepEqual(events, ['input', 'base', 'input', 'base']);
  assert.equal(one.state('base').value, 22);
  assert.equal(two.state('base').value, 4);
  one.state('base').nested.count++;
  assert.equal(two.state('base').nested.count, 0);
  const scope = { zero: 0, empty: '', nil: null };
  one.importInto(scope, 'input');
  assert.deepEqual({ ...scope }, { zero: 0, empty: '', nil: 40, untouched: 50 });
  scope.nil = 9;
  assert.equal(one.state('input').nil, 9);
  one.importInto(scope, 'base');
  assert.equal(scope.fromInit, 5);
  assert.equal(own(scope, '___PRIVATE_hidden'), false);
  scope.value = 100;
  assert.equal(one.state('base').value, 100);
  one.state('base').addedLater = 9;
  assert.equal(own(one.importInto({}, 'base'), 'addedLater'), false);
  const number = { score: 7 };
  one.call('base', 'change', reference(number, 'score'));
  assert.equal(number.score, 8);
});

const own = (object, key) => Object.hasOwn(object, key);

test('concurrent asynchronous calls retain their own explicit caller and module state', async () => {
  const registry = new ModuleRegistry([
    { name: 'base', state: () => ({ calls: [] }), functions: { work(ctx, value) { ctx.state().calls.push(value); return value; } } },
    { name: 'top', dependencies: ['base'], functions: {
      async work(ctx, value) { await new Promise(resolve => setImmediate(resolve)); return ctx.call('base', 'work', value) + 1; },
    } },
  ]);
  const a = await registry.createSession();
  const b = await registry.createSession();
  assert.deepEqual(await Promise.all([a.call('base', 'work', 4), b.call('base', 'work', 7)]), [5, 8]);
  assert.deepEqual(a.state('base').calls, [4]);
  assert.deepEqual(b.state('base').calls, [7]);
});

test('shared configuration and state factory objects are copied for every request', async () => {
  const defaults = { defaultList: [{ value: 1 }] };
  const config = { input: { nested: { value: 4 } } };
  const service = { calls: 0 };
  const registry = new ModuleRegistry([{ name: 'base', state: () => defaults, functions: {
    work(ctx) { ctx.state().input.nested.value++; ctx.state().defaultList[0].value++; ctx.services.calls++; },
  } }]);
  const [one, two] = await Promise.all([
    registry.createSession({ states: { base: config }, services: service }),
    registry.createSession({ states: { base: config }, services: service }),
  ]);
  one.call('base', 'work');
  assert.equal(one.state('base').input.nested.value, 5);
  assert.equal(two.state('base').input.nested.value, 4);
  assert.equal(config.input.nested.value, 4);
  assert.equal(defaults.defaultList[0].value, 1);
  assert.equal(two.state('base').defaultList[0].value, 1);
  assert.equal(service.calls, 1);
});

test('native dispatch matches actual upstream __MAGIC__ and hook_register on PHP 7.4', async t => {
  const executable = process.env.DTS_REFERENCE_PHP || 'php';
  const version = spawnSync(executable, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', windowsHide: true });
  if (version.error?.code === 'ENOENT' || version.stdout?.trim() !== '7.4') {
    t.skip('Differential oracle requires development-only PHP 7.4; production module dispatch is pure JavaScript.');
    return;
  }
  const parent = path.join(project, 'var', 'tests');
  await mkdir(parent, { recursive: true });
  const root = await mkdtemp(path.join(parent, 'native-modules-'));
  try {
    await mkdir(path.join(root, 'include', 'modulemng'), { recursive: true });
    await writeFile(path.join(root, 'include', 'modulemng', 'modulemng.config.php'), '<?php $___MOD_CODE_ADV2=0;');
    await copyFile(path.join(project, 'engine', 'include', 'modules', 'modules.func.php'), path.join(root, 'modules.func.php'));
    const oracle = `<?php
namespace { define('GAME_ROOT', __DIR__.'/'); require __DIR__.'/modules.func.php'; $trace=[]; }
namespace base {
 function action($count,&$box) { if(eval(__MAGIC__)) return $___RET_VALUE; global $trace; $trace[]='b'.$count; $box++; return $count ? action($count-1,$box) : 1; }
 function helper($count,&$box) { if(eval(__MAGIC__)) return $___RET_VALUE; return action($count,$box); }
}
namespace middle {
 function action($count,&$box) { if(eval(__MAGIC__)) return $___RET_VALUE; global $trace; $trace[]='m'.$count; return \\base\\action($count,$box)+10; }
}
namespace top {
 function action($count,&$box) { if(eval(__MAGIC__)) return $___RET_VALUE; global $trace; $trace[]='t'.$count; return $chprocess($count,$box)+100; }
 function helper($count,&$box) { if(eval(__MAGIC__)) return $___RET_VALUE; return $chprocess($count,$box); }
}
namespace {
 foreach (['base','middle','top'] as $name) hook_register($name,'action');
 foreach (['base','top'] as $name) hook_register($name,'helper');
 $out=[];
 foreach (['base','middle','top'] as $name) { $trace=[]; $box=0; $fn=$name.'\\\\action'; $result=$fn(2,$box); $out[]=[$result,$box,$trace]; }
 $trace=[]; $box=0; $result=\\base\\helper(1,$box); $out[]=[$result,$box,$trace];
 echo json_encode($out);
}`;
    const file = path.join(root, 'oracle.php');
    await writeFile(file, oracle);
    const result = spawnSync(executable, ['-d', 'display_errors=stderr', file], { encoding: 'utf8', windowsHide: true, timeout: 20_000 });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, '');
    const session = await new ModuleRegistry(dispatchDefinitions()).createSession();
    const actual = [];
    for (const name of ['base', 'middle', 'top']) {
      session.state('base').trace = [];
      const box = { value: 0 };
      actual.push([session.call(name, 'action', 2, box), box.value, session.state('base').trace]);
    }
    session.state('base').trace = [];
    const box = { value: 0 };
    actual.push([session.call('base', 'helper', 1, box), box.value, session.state('base').trace]);
    assert.deepEqual(actual, JSON.parse(result.stdout));
  } finally {
    assert.ok(path.resolve(root).startsWith(path.resolve(parent) + path.sep));
    await rm(root, { recursive: true, force: true });
  }
});
