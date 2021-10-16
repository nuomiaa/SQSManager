const { WebSocketObserver } = require("../../model/WebSocketModel");
const SQPingProtocol = require("../../helper/SQPingProtocol");
const serverModel = require('../../model/ServerModel');
const permssion = require("../../helper/Permission");
const response = require("../../helper/Response");
const QRcon = require("../../helper/Rcon");

WebSocketObserver().listener("rcon/update", (data) => {
    let UserName = data.WsSession.username;
    let ServerName = data.body;
    if (!permssion.isCanServer(UserName, ServerName)) return;

    let SQPing = SQPingProtocol.QuerySQPingTask(ServerName);
    if (!SQPing) {
        response.wsMsgWindow(data.ws, "✘ 错误：服务器未启动");
        return;
    }
    const server = serverModel.ServerManager().getServer(ServerName);

    server.dataModel.rcon = new QRcon(server.dataModel.SQRconConfig.SQRconPort, server.dataModel.SQRconConfig.SQRconPassword);
    server.dataModel.rcon.getMap().then((res) => {
        response.wsSend(data.ws, "rcon/update", {
            username: UserName,
            servername: ServerName,
            MapData: res,
            SQPing: SQPing
        });
    }, (err) => {
        response.wsMsgWindow(data.ws, "✘ 错误："+err);
    });
});

WebSocketObserver().listener("rcon/end", (data) => {
    let UserName = data.WsSession.username;
    let ServerName = data.body;
    if (!permssion.isCanServer(UserName, ServerName)) return;
    let SQPing = SQPingProtocol.QuerySQPingTask(ServerName);
    if (!SQPing) return;
    const server = serverModel.ServerManager().getServer(ServerName);
    server.dataModel.rcon.DisconnectRcon();
});

WebSocketObserver().listener("rcon/kick", (data) => {
    let UserName = data.WsSession.username;
    let obj = JSON.parse(data.body) || {};
    if (!permssion.isCanServer(UserName, obj.ServerName)) return;
    const server = serverModel.ServerManager().getServer(obj.ServerName);
    server.dataModel.rcon.execute(`AdminKick "${obj.Name}" ${obj.Reason}`);
});

WebSocketObserver().listener("rcon/ban", (data) => {
    let UserName = data.WsSession.username;
    let obj = JSON.parse(data.body) || {};
    if (!permssion.isCanServer(UserName, obj.ServerName)) return;
    const server = serverModel.ServerManager().getServer(obj.ServerName);
    server.dataModel.rcon.execute(`AdminBan "${obj.Name}" ${obj.Time} "${obj.Reason}"`);
});

WebSocketObserver().listener("rcon/warn", (data) => {
    let UserName = data.WsSession.username;
    let obj = JSON.parse(data.body) || {};
    if (!permssion.isCanServer(UserName, obj.ServerName)) return;
    const server = serverModel.ServerManager().getServer(obj.ServerName);
    server.dataModel.rcon.execute(`AdminWarn "${obj.Name}" "${obj.Message}"`)
});

WebSocketObserver().listener("rcon/team", (data) => {
    let UserName = data.WsSession.username;
    let obj = JSON.parse(data.body) || {};
    if (!permssion.isCanServer(UserName, obj.ServerName)) return;
    const server = serverModel.ServerManager().getServer(obj.ServerName);
    server.dataModel.rcon.execute(`AdminForceTeamChange "${obj.Name}"`)
});

WebSocketObserver().listener("rcon/cl", (data) => {
    let UserName = data.WsSession.username;
    let obj = JSON.parse(data.body) || {};
    if (!permssion.isCanServer(UserName, obj.ServerName)) return;
    const server = serverModel.ServerManager().getServer(obj.ServerName);
    server.dataModel.rcon.execute(`AdminChangeLayer ${obj.ChangeMapName}`)
});

WebSocketObserver().listener("rcon/snl", (data) => {
    let UserName = data.WsSession.username;
    let obj = JSON.parse(data.body) || {};
    if (!permssion.isCanServer(UserName, obj.ServerName)) return;
    const server = serverModel.ServerManager().getServer(obj.ServerName);
    server.dataModel.rcon.execute(`AdminSetNextLayer ${obj.SetNextMapName}`)
});

WebSocketObserver().listener("rcon/broadcast", (data) => {
    let UserName = data.WsSession.username;
    let obj = JSON.parse(data.body) || {};
    if (!permssion.isCanServer(UserName, obj.ServerName)) return;
    const server = serverModel.ServerManager().getServer(obj.ServerName);
    server.dataModel.rcon.execute(`AdminBroadcast "${obj.Message}"`)
});