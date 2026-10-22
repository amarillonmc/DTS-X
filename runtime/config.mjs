import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export function readConfig(env = process.env) {
  const integer = (name, fallback, min, max) => {
    const value = Number(env[name] || fallback);
    if (!Number.isInteger(value) || value < min || value > max) throw new Error(`${name} must be ${min}..${max}`);
    return value;
  };
  const port = integer('PORT', 3000, 1, 65535);
  const publicUrl = new URL(env.PUBLIC_URL || `http://localhost:${port}`);
  if (!['http:', 'https:'].includes(publicUrl.protocol) || publicUrl.pathname !== '/' || publicUrl.search || publicUrl.hash || publicUrl.username || publicUrl.password) throw new Error('PUBLIC_URL must be an http(s) origin without a subdirectory');
  const dbName = env.DB_NAME || 'dtsx';
  const tablePrefix = env.TABLE_PREFIX || 'dtsx_';
  if (!/^[a-zA-Z0-9_]+$/.test(dbName) || !/^[a-zA-Z][a-zA-Z0-9_]*_$/.test(tablePrefix)) throw new Error('Invalid DB_NAME or TABLE_PREFIX');
  const stateRoot = path.resolve(projectRoot, env.DATA_DIR || 'var');
  const sourceRoot = path.join(projectRoot, 'engine');
  const within = (candidate, root) => candidate === root || candidate.startsWith(root + path.sep);
  if (within(projectRoot, stateRoot) || within(stateRoot, sourceRoot)) throw new Error('DATA_DIR must be separate from the source tree and cannot contain the project');
  const maxBody = integer('MAX_BODY_MB', 64, 1, 1024) * 1024 * 1024;
  return {
    projectRoot, sourceRoot: path.join(projectRoot, 'engine'), runtimeRoot: path.join(projectRoot, 'runtime'),
    stateRoot, engineRoot: path.join(stateRoot, 'game'), port, host: env.HOST || '127.0.0.1',
    publicUrl: publicUrl.origin, dbHost: env.DB_HOST || '127.0.0.1', dbPort: integer('DB_PORT', 3306, 1, 65535),
    dbName, dbUser: env.DB_USER || 'dtsx', dbPassword: env.DB_PASSWORD || '', tablePrefix,
    adminUser: env.ADMIN_USER || 'admin', adminPassword: env.ADMIN_PASSWORD || '',
    workers: integer('PHP_WORKERS', 2, 1, 16), internalWorkers: integer('PHP_INTERNAL_WORKERS', 4, 2, 16),
    title: env.GAME_TITLE || '新电波 DTS', autoSetup: env.AUTO_SETUP === '1',
    maintenance: env.MAINTENANCE !== '0', trustProxy: env.TRUST_PROXY === '1', maxBody,
  };
}
