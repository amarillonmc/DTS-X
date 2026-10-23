import { EventEmitter } from 'node:events';

// mysql2 3.24.6 has no public setServerOption wrapper. Use its queued command
// interface to send the standard COM_SET_OPTION packet on the same connection.
// This is deliberately small and version-pinned, covered against real MariaDB.
// Protocol: COM_SET_OPTION=27; enum_mysql_set_option: ON=0, OFF=1.
// Sources: MySQL/MariaDB mysql_com.h and mysql2 lib/constants/commands.js.
class SetMultiStatements extends EventEmitter {
  constructor(enabled, callback) { super(); this.enabled = enabled; this.onResult = callback; this.sent = false; }
  execute(packet, connection) {
    if (!this.sent) {
      this.sent = true; connection._resetSequenceId();
      const buffer = Buffer.from([3, 0, 0, 0, 27, this.enabled ? 0 : 1, 0]);
      connection.writePacket({ buffer, length: () => 3, writeHeader(sequence) { buffer[3] = sequence; } });
      return false;
    }
    if (packet.isError()) this.onResult(packet.asError(connection.clientEncoding));
    else if (packet.isEOF() || packet.buffer[packet.offset] === 0) this.onResult(null);
    else this.onResult(Object.assign(new Error('Unexpected COM_SET_OPTION response'), { code: 'INVALID_OPTION_RESPONSE' }));
    this.emit('end'); return true;
  }
}

export function setMultiStatements(promiseConnection, enabled) {
  return new Promise((resolve, reject) => {
    const connection = promiseConnection.connection;
    if (typeof connection?.addCommand !== 'function' || typeof connection?._resetSequenceId !== 'function') { reject(new Error('Unsupported mysql2 command API')); return; }
    connection.addCommand(new SetMultiStatements(enabled, error => error ? reject(error) : resolve()));
  });
}
