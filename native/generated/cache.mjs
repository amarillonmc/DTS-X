import * as v from '../templates/values.mjs';

// Derived configuration is inert, versioned data. These filenames are the only
// executable-cache sites in the original modules; source PHP is never loaded.
const cacheNames = /^(?:card_index|card_gaining_method|skill490itmksk|randmix|common_itemnum|gtype1item)\.config\.php$|^randrecipe\d+\.php$/;
export function cachePath(value) {
  if (typeof value !== 'string') return value;
  const path = value.replaceAll('\\', '/').replace(/^(?:\.\/|\/)+/, '').replaceAll('/./', '/');
  return path.startsWith('gamedata/cache/') && cacheNames.test(path.slice('gamedata/cache/'.length)) ? path.replace(/\.php$/, '.native.json') : value;
}
export const isDataCache = value => cachePath(value) !== value && /\.native\.json$/.test(cachePath(value));
const encode = value => v.isArray(value) ? { entries: v.entries(value).map(([key, child]) => [key, encode(child)]) } : Buffer.isBuffer(value) ? { bytes: value.toString('base64') } : value;
const decode = value => value && typeof value === 'object' ? Array.isArray(value.entries) ? v.array(value.entries.map(([key, child]) => [key, decode(child)])) : typeof value.bytes === 'string' ? Buffer.from(value.bytes, 'base64') : (() => { throw new Error('Invalid native cache value'); })() : value;
export async function writeDataCache(files, filename, fields) {
  if (!isDataCache(filename)) throw new Error(`Unregistered native data cache ${filename}`);
  const content = JSON.stringify({ format: 'dts-native-cache-1', fields: encode(fields) });
  await files.write(cachePath(filename), content, 'wb'); return Buffer.byteLength(content);
}
export async function readDataCache(files, filename, scope) {
  if (!isDataCache(filename)) throw new Error(`Unregistered native data cache ${filename}`);
  const content = JSON.parse(await files.readText(cachePath(filename)));
  if (content.format !== 'dts-native-cache-1') throw new Error('Unsupported native data cache format');
  for (const [name, value] of v.entries(decode(content.fields))) {
    if (typeof name !== 'string' || !/^[a-zA-Z_]\w*$/.test(name)) throw new Error('Invalid native cache binding');
    v.assign(v.slot(scope, [name]), value);
  }
  return 1;
}
