const { WebSocketObserver } = require("../../model/WebSocketModel");
const permssion = require("../../helper/Permission");
const response = require("../../helper/Response");

//获取信息
WebSocketObserver().listener("soft/view", (data) => {
  if (!permssion.isMaster(data.WsSession)) return;
  response.wsSend(data.ws, "soft/view", {
    softConfig: SQSERVER.softConfig
  });
});

//更新配置
WebSocketObserver().listener("soft/update", (data) => {
  if (!permssion.isMaster(data.WsSession)) return;
  let newConfig = JSON.parse(data.body);
  if (newConfig) {
    for (let k in SQSERVER.softConfig) {
      if (k == "__filename__") continue;
      SQSERVER.softConfig[k] = newConfig[k];
    }
  }
  SQSERVER.softConfig.save();
  response.wsMsgWindow(data.ws, "修改完成，部分内容重启控制面板生效 √");
});
