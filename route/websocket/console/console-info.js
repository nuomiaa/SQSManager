const response = require("../../../helper/Response");
var serverModel = require("../../../model/ServerModel");
const permssion = require("../../../helper/Permission");
const { WebSocketObserver } = require("../../../model/WebSocketModel");
const os = require("os");

const SQPingProtocol = require("../../../helper/SQPingProtocol");

//控制台信息获取
WebSocketObserver().listener("server/console", (data) => {
  // permssion.needLogin(req, res);
  let userName = data.WsSession.username;
  let serverName = data.body.trim();

  if (permssion.isCanServer(userName, serverName)) {
    let serverData = serverModel.ServerManager().getServer(serverName);
    let sysMonery = ((os.freemem() / 1024 / (os.totalmem() / 1024)) * 100).toFixed(2);
    // let cpu = SQSERVER.dataCenter.cacheCPU;
    response.wsSend(data.ws, "server/console", {
      serverData: serverData.dataModel,
      run: serverData.isRun(),
      update: serverData.isUpdate(),
      sysMonery: sysMonery,
      sysCpu: SQSERVER.dataCenter.cacheCPU,
      CPUlog: SQSERVER.logCenter.CPU,
      RAMlog: SQSERVER.logCenter.RAM,
      userName: userName,
      SQPing: SQPingProtocol.QuerySQPingTask(serverName) || {
        current_players: "--",
        max_players: "--"
      }
    });
    // SQSERVER.log('准许用户 [' + userName + '] 获取控制台实时数据');
  }
});
