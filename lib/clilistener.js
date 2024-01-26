const events = require('events');
const net    = require('net');

// TODO: Update to class syntax
function CliListener(port) {
  const _this      = this;
  const emitLog    = (text) => { _this.emit('log', text); } // TODO: Log directly(?)
        this.start = () => {
                       // TODO: Move host to config
                       net.createServer((connection) => {
                         let data = '';

                         try {
                           connection.on('data', (buffer) => {
                             data += buffer;

                             if (data.slice(-1) === '\n') {
                               const message = JSON.parse(data);

                               _this.emit(
                                 'command',
                                 message.command,
                                 message.params,
                                 message.options,
                                 (message) => { connection.end(message); }
                               );
                             }
                           }).on('end', () => {}).on('error', () => {});
                         } catch (error) {
                           emitLog(`CLI listener failed to parse data, ${ data }`);
                         }
                       }).listen(port, '::', () => { emitLog(`CLI listening on port ${ port }`); });
                     };
}

CliListener.prototype.__proto__ = events.EventEmitter.prototype;
module.exports                  = CliListener;
