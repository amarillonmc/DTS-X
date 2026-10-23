import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { definitions } from '../native/generated/remaining/catalog.mjs';
import { definitions as skills } from '../native/generated/catalog.mjs';
import { createGeneratedServices, createModuleContext } from '../native/generated/context.mjs';
import { cachePath, readDataCache, writeDataCache } from '../native/generated/cache.mjs';
import * as v from '../native/templates/values.mjs';

const normalize = value => v.isArray(value) ? { entries: v.entries(value).map(([key, child]) => [key, normalize(child)]) } : value;
test('derived native configuration is ordered inert data, and skill490 cold/warm values match actual PHP source', async t => {
  const parent = path.resolve('var/tests'); await fs.mkdir(parent, { recursive: true }); const root = await fs.mkdtemp(path.join(parent, 'generated-cache-'));
  t.after(async () => { assert.ok(root.startsWith(parent + path.sep)); await fs.rm(root, { recursive: true, force: true }); });
  const source = path.resolve('engine'), writes = [];
  const resolve = filename => { const relative = filename.replace(/^(?:\.\/|\/)+/, ''); const result = path.resolve(relative.startsWith('gamedata/') ? root : source, relative); assert.ok(result.startsWith(root + path.sep) || result.startsWith(source + path.sep)); return result; };
  const files = { readText: filename => fs.readFile(resolve(filename), 'utf8'),
    async exists(filename) { try { await fs.stat(resolve(filename)); return true; } catch (error) { if (error.code === 'ENOENT') return false; throw error; } },
    async mtime(filename) { return Math.floor((await fs.stat(resolve(filename))).mtimeMs / 1000); },
    async write(filename, content) { writes.push(filename); const target = resolve(filename); assert.ok(target.startsWith(root + path.sep)); await fs.mkdir(path.dirname(target), { recursive: true }); await fs.writeFile(target, content); },
  };
  const filename = './gamedata/cache/common_itemnum.config.php', original = v.array([['cont_mapitem', v.array([[9, ['甲', '0']], [2, [5, false]], ['01', null]])]]);
  await writeDataCache(files, filename, original); const restored = {}; await readDataCache(files, filename, restored);
  assert.deepEqual(normalize(restored), normalize(original)); assert.match(await files.readText(cachePath(filename)), /dts-native-cache-1/);
  assert.doesNotMatch(await files.readText(cachePath(filename)), /<\?php/);
  const generated = createGeneratedServices({ files, constants: { IN_GAME: true, GAME_ROOT: '', IN_GAME_CHECK_STR: "<?php if(!defined('IN_GAME')) exit('Access Denied'); ?>" }, functions: { chmod: async () => true } });
  const modules = new Map([...definitions, ...skills].map(module => [module.name, module])), services = { generated, files };
  const context = module => ({ services, state: () => ({}), hasModule: name => modules.has(name), call: (target, fn, ...args) => modules.get(target).functions[fn](context(target), ...args) });
  const first = await context('skill490').call('skill490', 'get_random_itmksklist490'), writeCount = writes.length;
  const second = await context('skill490').call('skill490', 'get_random_itmksklist490'); assert.deepEqual(normalize(second), normalize(first)); assert.equal(writes.length, writeCount, 'warm cache does not regenerate');
  const phpRoot = path.join(root, 'php'); await fs.mkdir(path.join(phpRoot, 'gamedata/cache'), { recursive: true }); await fs.symlink(source + path.sep + 'include', phpRoot + path.sep + 'include', 'junction');
  // This test-only source tree is a junction for read-only configuration; all
  // generated PHP oracle cache files remain under the isolated temporary root.
  const code = "define('IN_GAME',true);define('__MAGIC__','return false;');define('IN_GAME_CHECK_STR',\"<?php if(!defined('IN_GAME')) exit('Access Denied'); ?>\");define('GAME_ROOT',getcwd().'/');function openfile($f){return file($f);}function check_filemtime_expired($obj,$src){if(!file_exists($obj))return true;foreach($src as $s)if(file_exists($s)&&filemtime($s)>filemtime($obj))return true;return false;}function canon($v){if(!is_array($v))return $v;$e=[];foreach($v as $k=>$c)$e[]=[$k,canon($c)];return ['entries'=>$e];}require 'include/modules/extra/attr/attrbase/main.php';require 'include/modules/extra/card/skills/skill490/main.php';echo json_encode(canon(skill490\\get_random_itmksklist490()),JSON_UNESCAPED_UNICODE);";
  const php = spawnSync(process.env.DTS_REFERENCE_PHP || 'php', ['-d', 'display_errors=stderr', '-d', 'error_reporting=22519', '-r', code], { cwd: phpRoot, encoding: 'utf8', windowsHide: true, maxBuffer: 4 * 1024 * 1024 });
  assert.equal(php.status, 0, php.stderr); assert.deepEqual(normalize(first), JSON.parse(php.stdout));
  await fs.unlink(path.join(phpRoot, 'include'));
  const output = await fs.readdir(path.join(root, 'gamedata/cache')); assert.ok(output.every(name => name.endsWith('.native.json')));
});
