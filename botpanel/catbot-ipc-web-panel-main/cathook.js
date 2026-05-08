const child_process = require('child_process');
const EventEmitter = require('events');
const extend = require('extend');

const CATHOOK_ROOT = process.env.CATHOOK_ROOT || '/opt/cathook';
const CONSOLE_PATH = `${CATHOOK_ROOT}/ipc/bin/console`;

class CathookConsole extends EventEmitter {
    constructor() {
        super();
        var self = this;
        this.init = false;
        this.next_cmdid = 1;
        this.process = child_process.spawn(CONSOLE_PATH);
        this.process.on('exit', function (code) {
            self.init = false;
            self.emit('exit');
            console.log('[!] cathook console exited with code', code);
        });
        var buff = '';
        this.process.stdout.on('data', function (data) {
            var z = data.toString();
            for (var i = 0; i < z.length; i++) {
                if (z[i] == '\n') {
                    try {
                        var cleanBuff = buff.replace(/[\uFFFD\uFFFE\uFFFF]/g, '');
                        var d = JSON.parse(cleanBuff);
                        self.emit('data', d);
                    } catch (e) {
                        console.log('Error parsing IPC data:', e.message);
                        console.log('Raw buffer:', buff);
                        self.emit('data', null);
                    }
                    buff = '';
                } else {
                    buff += z[i];
                }
            }
        });
        this.on('data', function (data) {
            if (!data) return;
            if (data.init) {
                self.init = true;
                self.emit('init');
            };
        });
    }
    command(cmd, data, callback) {
        data = extend({}, data || {}, { "command": cmd });
        if (callback) {
            const cmdid = String(this.next_cmdid++);
            data.cmdid = cmdid;
            const handler = (response) => {
                if (!response || response.cmdid !== cmdid)
                    return;

                this.removeListener('data', handler);
                callback(response);
            };
            this.on('data', handler);
        }
        this.process.stdin.write(JSON.stringify(data) + '\n');
    }
    stop() {
        this.command("exit", {});
    }
}

module.exports = CathookConsole;
