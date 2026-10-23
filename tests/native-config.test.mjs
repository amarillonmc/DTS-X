import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { readNativeConfig,projectRoot } from '../native/config.mjs';

test('native configuration separates private state, URLs and database identifiers',()=>{
  const defaults=readNativeConfig({});assert.equal(defaults.stateRoot,path.join(projectRoot,'var/native'));assert.equal(defaults.systemConfig.gtablepre,'dtsx_');
  assert.equal(readNativeConfig({DATA_DIR:'var/fixture'}).stateRoot,path.join(projectRoot,'var/fixture/native'));
  assert.equal(readNativeConfig({NATIVE_DATA_DIR:'var/explicit'}).stateRoot,path.join(projectRoot,'var/explicit'));
  for(const PUBLIC_URL of ['file:///test','https://a.test/path','https://a.test/?a=1','https://user:pass@a.test'])assert.throws(()=>readNativeConfig({PUBLIC_URL}),/PUBLIC_URL/);
  for(const NATIVE_DATA_DIR of ['.','..','engine/data','public/cache'])assert.throws(()=>readNativeConfig({NATIVE_DATA_DIR}),/NATIVE_DATA_DIR/);
  for(const TABLE_PREFIX of ['dts_;DROP','../','1prefix_'])assert.throws(()=>readNativeConfig({TABLE_PREFIX}),/TABLE_PREFIX/);
  assert.throws(()=>readNativeConfig({DB_PORT:'0'}),/DB_PORT/);assert.throws(()=>readNativeConfig({NATIVE_TICK_MS:'1'}),/NATIVE_TICK_MS/);
});
