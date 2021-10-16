const { WebSocketObserver } = require("../../model/WebSocketModel");
const { userCenter } = require("../../model/UserModel");
const serverModel = require("../../model/ServerModel");
const permssion = require("../../helper/Permission");
const response = require("../../helper/Response");

// 保存配置
WebSocketObserver().listener("SQRcon/config_save", (data) => {
  const jsonObject = JSON.parse(data.body);
  const serverName = jsonObject.SQRconServerName;
  const userName = data.WsSession.username;
  const user = userCenter().get(userName);
  if (!user) {
    return;
  }
  if (SQSERVER.localProperty.AccessProtect) {
    if (!permssion.isMaster(data.WsSession)) {
      response.wsMsgWindow(data.ws, "✘ 错误：权限不足，已启用访问保护")
      return
    }
  }
  if (permssion.isCanServer(userName, serverName)) {
    const SQServer = serverModel.ServerManager().getServer(serverName);
    SQServer.dataModel.SQRconConfig = {
      SQRconPort: jsonObject.SQRconConfig.SQRconPort || "",
      SQRconPassword: jsonObject.SQRconConfig.SQRconPassword || ""
    };
    // console.log('SQPing SQServer.dataModel:', SQServer.dataModel)
    SQServer.dataModel.save();
  }
  response.wsSend(data.ws, "SQRcon/config_save", true);
});

// 获取配置
WebSocketObserver().listener("SQRcon/config", (data) => {
  const ServerName = data.body || "";
  const UserName = data.user;
  if (!ServerName || !UserName){
    return;
  }
  if (SQSERVER.localProperty.AccessProtect) {
    if (!permssion.isMaster(data.WsSession)) {
      response.wsMsgWindow(data.ws, "✘ 错误：权限不足，已启用访问保护")
      return
    }
  }
  if (permssion.isCanServer(UserName, ServerName)) {
    const SQServer = serverModel.ServerManager().getServer(ServerName);
    let DataU = SQServer['dataModel']['SQRconConfig'];
    DataU.SQPingPort = SQServer.dataModel.QueryPort;
    response.wsSend(data.ws, "SQRcon/config", DataU);
  }
});