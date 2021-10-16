const { Rcon } = require("rcon-client");

module.exports = class {
    constructor(Port, Password) {
        this.info = {host: "127.0.0.1", port: Port, password: Password};
    }
    async ConnectRcon() {
        this.rcon = await Rcon.connect(this.info);
        this._connect = true;
    }
    DisconnectRcon() {
        this.rcon.end()
    }
    async getCurrentMap() {
        const response = await this.rcon.send('ShowCurrentMap');
        const match = response.match(/^Current level is (.*), layer is (.*)/);
        return match[2];
    }

    async getNextMap() {
        const response = await this.rcon.send('ShowNextMap');
        const match = response.match(/^Next level is (.*), layer is (.*)/);
        return match[2] == 'To be voted' ? '待投票' : match[2];
    }
    async getMap() {
        if (!this._connect) await this.ConnectRcon();
        return {
            current: await this.getCurrentMap(),
            next: await this.getNextMap()
        }
    }
    async execute(exe) {
        return await this.rcon.send(exe);
    }
}