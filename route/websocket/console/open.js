const response = require("../../../helper/Response");
var serverModel = require("../../../model/ServerModel");
const permssion = require("../../../helper/Permission");
const { WebSocketObserver } = require("../../../model/WebSocketModel");
const SQPingProtocol = require("../../../helper/SQPingProtocol");

//开启服务器
WebSocketObserver().listener("server/console/open", (data) => {
  let serverName = data.body.trim();
  let userName = data.WsSession.username;
  if (permssion.isCanServer(userName, serverName)) {
    SQSERVER.log("用户 ", userName, " 正在启动 ", serverName, " 服务端实例...");
    try {
      let retu = serverModel.startServer(serverName);
      if (!retu) {
        response.wsMsgWindow(data.ws, "服务器无法启动,建议检查配置或权限");
        return;
      }
      response.wsSend(data.ws, "server/console/open", true);
      // 传递开启服务端事件
      serverModel.ServerManager().emit("open_next", {
        serverName: serverName
      });
    } catch (err) {
      response.wsMsgWindow(data.ws, "" + err);
    }
    return;
  }
  response.wsSend(data.ws, "server/console/open", null);
});

// 服务端开启后的第一事件
serverModel.ServerManager().on("open_next", (data) => {
  const server = serverModel.ServerManager().getServer(data.serverName);
  if (server) {
    SQPingProtocol.CreateSQPingTask(data.serverName, parseInt(server.dataModel.QueryPort));
  }
});
