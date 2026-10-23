import { roomIsSubroom, roomIdToPrefix } from '../system/rooms.mjs';
import { gencode, gdecode } from '../protocol/codec.mjs';
import { n, text, equal } from '../system/sys-support.mjs';

/** Original roomupdate protocol, retaining its distinction between an invalid
 * room at entry (redirect) and a room removed during the long poll (empty). */
export async function roomUpdate(host, scope, { timestamp = 0, roomId = scope.room_id, signal } = {}) {
  const { database, rooms, files, broadcast } = host;
  await host.accounts.authenticate({ ...scope, script: 'roomupdate' });
  const marker = `gamedata/tmp/rooms/${text(roomId)}.txt`;
  const read = async () => {
    if (!await files.exists(marker)) return null;
    return (await database.query(`SELECT groomid,groomstatus,groomtype,roomvars FROM ${scope.gtablepre}game WHERE groomid='${text(roomId)}'`))[0] ?? null;
  };
  let row = roomIsSubroom(roomIdToPrefix(roomId)) ? await read() : null;
  if (!row || equal(row.groomstatus, 0)) { await rooms.setCurrentId(0); return gencode({ url: 'index.php' }); }
  if (n(row.groomstatus) >= 40) return gencode({ url: 'game.php' });
  let data = gdecode(row.roomvars);
  if (Math.trunc(n(timestamp)) < n(data.timestamp)) return rooms.showData(data, scope.cuser);
  const change = await broadcast.wait(roomId, async () => {
    const fresh = await read();
    if (!fresh || equal(fresh.groomstatus, 0)) return { gone: true };
    if (n(fresh.groomstatus) >= 40 || n(gdecode(fresh.roomvars).timestamp) > Math.trunc(n(timestamp))) return { row: fresh };
    return null;
  }, { signal });
  if (!change || change.gone) return '';
  row = change.row;
  if (n(row.groomstatus) >= 40) return gencode({ url: 'game.php' });
  data = gdecode(row.roomvars);
  return rooms.showData(data, scope.cuser);
}
