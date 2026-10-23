import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const within = (candidate, base) => {
  const relative = path.relative(base, candidate);
  return relative === '' || (!path.isAbsolute(relative) && relative !== '..' && !relative.startsWith('..' + path.sep));
};

// Resolve missing descendants through their nearest existing parent BEFORE
// mkdir. A junction in a parent must not let even a lock probe write to source.
async function projectedRealpath(target) {
  const suffix = []; let cursor = target;
  while (true) {
    try { return path.resolve(await fs.realpath(cursor), ...suffix); }
    catch (error) {
      if (error.code !== 'ENOENT') throw error;
      const parent = path.dirname(cursor);
      if (parent === cursor) throw error;
      suffix.unshift(path.basename(cursor)); cursor = parent;
    }
  }
}

/** Validate a private state root before any writes. Existing roots themselves
 * cannot be links; safe parent links are resolved, including missing children.
 * Read-only callers leave a missing root missing. Existing permissions and
 * contents are never changed here; newly created directories are private.
 */
export async function privateStateRoot(stateRoot, { create = false, sourceRoot } = {}) {
  if (typeof stateRoot !== 'string' || !path.isAbsolute(stateRoot)) throw new TypeError('An absolute native state root is required');
  const resolved = path.resolve(stateRoot);
  const resources = [path.join(projectRoot, 'engine'), path.join(projectRoot, 'public')];
  if (sourceRoot) resources.push(path.resolve(sourceRoot));
  const projects = [projectRoot, await fs.realpath(projectRoot)];
  const protectedRoots = [...resources, ...await Promise.all(resources.map(projectedRealpath))];
  const validate = candidate => {
    if (projects.some(project => within(project, candidate)) || protectedRoots.some(base => within(candidate, base) || within(base, candidate))) {
      throw new Error('Private state must be separate from web/source roots');
    }
  };
  const inspect = async () => {
    try {
      const stat = await fs.lstat(resolved);
      if (stat.isSymbolicLink()) throw new Error('Native state root must not be a symlink');
      if (!stat.isDirectory()) throw new Error('Native state root must be a directory');
      return true;
    } catch (error) { if (error.code !== 'ENOENT') throw error; return false; }
  };
  validate(resolved);
  const exists = await inspect();
  const projected = await projectedRealpath(resolved); validate(projected);
  if (!exists && !create) return projected;
  if (!exists) await fs.mkdir(resolved, { recursive: true, mode: 0o700 });
  await inspect();
  const actual = await fs.realpath(resolved); validate(actual);
  return actual;
}
