import path from 'node:path';
import { fold, unfold } from '../protocol/archive.mjs';

/** Original global filesystem functions, constrained by the host's private
 * file service. Archive decoding validates every name before writing any file. */
export function createFileFunctions(files) {
  const list = value => value instanceof Map ? [...value.values()] : Object.values(value ?? {});
  const archive = async (destination, names, legacy = false) => {
    const entries = [];
    for (const name of list(names)) entries.push([path.posix.basename(String(name).replaceAll('\\', '/')), await files.readBytes(name)]);
    const bytes = fold(entries, { legacy });
    if (bytes === false) return false;
    await files.write(destination, bytes, 'wb');
    return legacy ? bytes.length : destination;
  };
  const extract = async source => {
    const entries = unfold(await files.readBytes(source)), directory = path.posix.dirname(String(source).replaceAll('\\', '/'));
    for (const [name, bytes] of entries) await files.write(`${directory}/${name}`, bytes, 'wb');
    return entries.size ? 1 : 0;
  };
  return {
    fold: archive, filelist_achieve: archive, fold_core: (destination, names) => archive(destination, names, true),
    unfold: extract, unfold_core: extract, filelist_unachieve: extract,
    gdir: (name, type = '') => files.list(name, type), is_dir: name => files.isDirectory(name), filesize: name => files.size(name),
    chmod: (name, mode) => files.chmod(name, mode), mkdir: name => files.mkdir(name),
    mymkdir: async name => { await files.mkdir(name); await files.chmod(name, 0o777); },
    create_dir: name => files.mkdir(name), dir_init: async name => { await files.mkdir(name); return name; },
    copy: async (source, destination) => { await files.write(destination, await files.readBytes(source), 'wb'); return true; },
  };
}
