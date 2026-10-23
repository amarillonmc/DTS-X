import { createLockServices } from '../storage/locks.mjs';
import { createUserService } from './users.mjs';
import { compareTimestampPass, realIp } from './primitives.mjs';
import { gencode, gdecode } from '../protocol/codec.mjs';
import { present, text } from '../gameplay/numbers.mjs';

/** Legacy userdb_receive wire endpoint with real database and OS locks.
 * `post` is the raw parsed form (no gstrfilter), matching the original endpoint;
 * only the host's trusted REMOTE_ADDR is accepted for peer IP restrictions.
 * Authenticated peers possess the original SQL-fragment protocol capability.
 * One receiver instance owns each lease through release/expiry. Deployments
 * with multiple Node processes must route a remote key to the same instance.
 * A process crash releases its OS locks; no pretend lock-file fallback exists.
 */
export function createRemoteUserReceiver({ database, tablePrefix = 'bra_', stateRoot, peers, clock = () => Date.now() / 1000, leaseMs = 10_000, lockTimeoutMs = 3000 }) {
  if (!(peers instanceof Map) && (!peers || typeof peers !== 'object')) throw new TypeError('Remote receiver requires an explicit peer allowlist');
  if (!Number.isFinite(leaseMs) || leaseMs <= 0) throw new TypeError('Remote lock lease must be positive');
  const allowed = peers instanceof Map ? peers : new Map(Object.entries(peers)), leases = new Map();
  let closed = false;
  const release = async (id, lease) => {
    if (leases.get(id) !== lease) return;
    leases.delete(id); clearTimeout(lease.timer);
    await lease.queue.catch(() => {});
    try { await lease.users.close(); } finally { await lease.locks.close(); }
  };
  const leaseFor = async id => {
    let lease = leases.get(id);
    if (!lease) {
      // Publish the promise before awaiting the filesystem to prevent two
      // simultaneous first requests from opening separate owners for one key.
      const promise = createLockServices(stateRoot).then(locks => ({ locks, users: createUserService({ database, tablePrefix, locks: locks.locks, script: 'userdb_receive', forcedLocal: true, lockTimeoutMs }), queue: Promise.resolve(), timer: null }));
      lease = { promise }; leases.set(id, lease);
      try { const ready = await promise; Object.assign(lease, ready); } catch (error) { leases.delete(id); throw error; }
    } else if (!lease.users) await lease.promise;
    clearTimeout(lease.timer); lease.timer = setTimeout(() => { release(id, lease).catch(() => {}); }, leaseMs); lease.timer.unref();
    return lease;
  };
  const handle = async (post, server = {}) => {
    if (closed) throw new Error('Remote user receiver is closed');
    const peer = typeof post?.sign === 'string' ? allowed.get(post.sign) : null;
    const ip = realIp({ REMOTE_ADDR: server.REMOTE_ADDR });
    if (!peer || typeof post.pass !== 'string' || !compareTimestampPass(post.pass, peer.pass, clock()) || (present(peer.ip) && peer.ip !== ip)) return 'Error: Invalid sign';
    if (!present(post.command)) return 'Error: Invalid command';
    if (post.command === 'get_ip') return gencode(ip);
    if (!['fetch_udata', 'insert_udata', 'update_udata', 'update_udata_multilist', 'release_user_lock_from_pool'].includes(post.command)) return 'Error: Invalid command 2';
    // Original clients generate hexadecimal uniqid(), or random hex in Node.
    // No filesystem path or unbounded arbitrary key is accepted from a peer.
    if (typeof post.key !== 'string' || !/^[a-fA-F0-9]{1,128}$/.test(post.key)) return 'Error: Invalid lock key';
    const id = post.sign + '\0' + post.key;
    if (post.command === 'release_user_lock_from_pool') {
      const lease = leases.get(id); if (lease) { if (!lease.users) await lease.promise; await release(id, lease); }
      return gencode('Info: Release success');
    }
    const lease = await leaseFor(id);
    const operation = async () => {
      const [p1,p2,p3,p4,p5] = [1,2,3,4,5].map(index => present(post['para' + index]) ? post['para' + index] : null);
      const count = async (where, sort = '') => (await lease.users.fetch('uid', where, sort, 0, 1)).length;
      let result;
      if (post.command === 'fetch_udata') {
        if (!text(p1).includes('COUNT(') && await count(p2, p3) > 500) return 'Error: Too many results';
        result = await lease.users.fetch(p1, p2, p3, p4, p5);
      } else {
        const data = gdecode(p1);
        if (!data || typeof data !== 'object') return 'Error: Invalid data';
        if (post.command === 'insert_udata') {
          if (!Object.hasOwn(data, 'username') && Object.keys(data).length > 10) return 'Error: Too many inserts';
          result = await lease.users.insert(data, p2);
        } else if (post.command === 'update_udata') {
          if (await count(p2) > 500) return 'Error: Too many updates';
          result = await lease.users.update(data, p2);
        } else {
          if (Object.keys(data).length > 500) return 'Error: Too many updates';
          result = await lease.users.updateMany(data);
        }
      }
      return gencode(result);
    };
    const result = lease.queue.then(operation); lease.queue = result.catch(() => {}); return result;
  };
  return Object.freeze({ handle, async close() {
    if (closed) return; closed = true;
    for (const [id, lease] of [...leases]) { if (!lease.users) await lease.promise; await release(id, lease); }
  } });
}
