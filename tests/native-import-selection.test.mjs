import test from 'node:test';
import assert from 'node:assert/strict';
import { selectImports } from '../scripts/native-compiler/select-imports.mjs';
import { ModuleRegistry } from '../native/modules/registry.mjs';
import { optimizeInitializers } from '../scripts/native-compiler/optimize-initializers.mjs';
import { createGeneratedServices } from '../native/generated/context.mjs';

const wrap = body => `export async function sample(ctx, ...args) {
  const r = createModuleContext(ctx, "extension", "function"), s = Object.create(null);
  r.imports(s, "source");
  ${body}
}`;

test('static scope analysis refuses dynamic keys, aliases, introspection and whole-scope consumers', () => {
  for (const body of [
    'return r.get(s, args[0]);', 'return r.get(s, "key" + args[0]);',
    'r.assign(r.slot(s, [args[0]]), 1);', 'r.assign(r.slot(s, ["key" + args[0]]), 1);',
    'return s;', 'const alias = s; return alias;', 'return Object.keys(s);',
    's.key = 2;', 'r.include("example", s);', 'r.extract(s, args[0]);',
    'r.call("get_defined_vars");', 'r.call("debug_backtrace");', 'r.call("compact", "key");',
    'r.call(args[0]);', 'r.namedCall("target");', 'r.imports(s, args[0]);',
    'r.imports(s, "source" + args[0]);', 'r.unknown(s, "key");',
    'r.assign(r.slot(s, []), 1);', 'const copy = { s };',
    'r.get = args[0]; return r.get(s, "key");', 'Object.assign(r, args[0]); return r.get(s, "key");',
  ]) {
    const source = wrap(body), result = selectImports(source);
    assert.equal(result.code, source, body); assert.equal(result.changed, 0, body);
  }
  const init = wrap('return r.get(s, "key");').replace('function sample(', 'function init(');
  assert.equal(selectImports(init).changed, 1);
  const preinit = init.replace('function init(', 'function ___pre_init(');
  assert.equal(selectImports(preinit).code, preinit);
  for (const signature of ['ctx, args = {}', '{ ctx }, ...args', 'ctx']) {
    const edited = wrap('return r.get(s, "key");').replace('ctx, ...args', signature);
    assert.equal(selectImports(edited).code, edited, 'Unfamiliar signature: ' + signature);
  }
});

test('initializer import selection retains init globals, exports and side-effect order', async () => {
  const source = `import { createModuleContext } from ${JSON.stringify(new URL('../native/generated/context.mjs', import.meta.url).href)};
export async function init(ctx, ...args) {
  const r = createModuleContext(ctx, "extension", "init"), s = Object.create(null);
  r.global(s, "published");
  r.global(s, "existing");
  r.imports(s, "source");
  r.assign(r.slot(s, ["counter"]), r.add(r.get(s, "counter"), 1));
  r.assign(r.slot(s, ["published"]), r.get(s, "counter"));
  r.assign(r.slot(s, ["existing"]), r.add(r.get(s, "existing"), 2));
  await r.call("define", "INIT_CONSTANT", r.get(s, "published"));
}`;
  const optimized = selectImports(source); assert.equal(optimized.changed, 1);
  async function run(code) {
    const { init } = await import('data:text/javascript,' + encodeURIComponent(code));
    const generated = createGeneratedServices({ globals: { existing: 5 } });
    const session = await new ModuleRegistry([
      { name: 'source', state: { counter: 10, unused: 9 } },
      { name: 'extension', dependencies: ['source'], initialize: init },
    ]).createSession({ services: { generated } });
    return { imported: session.importInto({}, 'extension'), state: session.state('source'), globals: generated.globals, constants: generated.constants };
  }
  assert.deepEqual(await run(optimized.code), await run(source));
  const result = await run(optimized.code);
  assert.deepEqual(Object.keys(result.imported), ['published']);
  assert.equal(result.imported.published, 11); assert.equal(result.globals.existing, 7); assert.equal(result.constants.INIT_CONSTANT, 11);
});

test('unused top-context removal leaves init invocation and nonempty initializers intact', () => {
  const empty = `  async initialize(ctx) {\n    const r = createModuleContext(ctx, "example", 'top'), s = ctx.state();\n    await init(ctx);\n  },`;
  assert.equal(optimizeInitializers(empty), '  async initialize(ctx) {\n    await init(ctx);\n  },');
  const used = empty.replace('    await init(ctx);', '    r.assign(r.slot(s, ["x"]), 1);\n    await init(ctx);');
  assert.equal(optimizeInitializers(used), used);
});

test('static import selection tracks read/write/reference fields and ignores strings and comments', () => {
  const source = wrap(`// s = escaped; r.extract(s, data);
    const brace = "}";
    const text = "r.get(s, dynamic)";
    r.parameter(s, "local", args[0], true);
    r.global(s, "global");
    r.assign(r.slot(s, ["table", r.get(s, "key")]), r.get(s, "value"));
    r.imports(s, "input", "source");
    return r.argument(r.slot(s, ["local"]));`);
  const selected = selectImports(source);
  assert.equal(selected.changed, 2);
  assert.match(selected.code, /r\.importsSelected\(s, \["local","global","table","key","value"\], "source"\)/);
  assert.match(selected.code, /r\.importsSelected\(s, \["local","global","table","key","value"\], "input", "source"\)/);
  assert.equal(selectImports(selected.code).code, selected.code, 'Optimization is idempotent');
});

test('selected imports preserve module collisions, INPUT isset, reference writes and session isolation', async () => {
  const source = `import { createModuleContext } from ${JSON.stringify(new URL('../native/generated/context.mjs', import.meta.url).href)};
export async function sample(ctx, ...args) {
  const r = createModuleContext(ctx, "extension", "function"), s = Object.create(null);
  r.parameter(s, "existing", args[0], false);
  r.imports(s, "input", "source");
  r.assign(r.slot(s, ["counter"]), r.add(r.get(s, "counter"), 1));
  r.assign(r.slot(s, ["table", "changed"]), 7);
  r.imports(s, "other");
  r.assign(r.slot(s, ["counter"]), r.add(r.get(s, "counter"), 2));
  return r.copy(r.array([[r.APPEND, r.get(s, "existing")], [r.APPEND, r.get(s, "counter")], [r.APPEND, r.get(s, "table")]]));
}`;
  const optimized = selectImports(source); assert.equal(optimized.changed, 2);
  async function run(code, input) {
    const { sample } = await import('data:text/javascript,' + encodeURIComponent(code));
    const registry = new ModuleRegistry([
      { name: 'input', state: { existing: 'input' } },
      { name: 'source', state: { counter: 10, table: { original: 1 }, unused: 'source' } },
      { name: 'other', state: { counter: 100 } },
      { name: 'extension', dependencies: ['input', 'source', 'other'], functions: { sample } },
    ]);
    const session = await registry.createSession(), fresh = await registry.createSession();
    const result = await session.call('extension', 'sample', input);
    return { result, source: session.state('source'), other: session.state('other'), fresh: fresh.state('source') };
  }
  for (const value of [null, 0, false, '', 'local']) assert.deepEqual(await run(optimized.code, value), await run(source, value));
});
