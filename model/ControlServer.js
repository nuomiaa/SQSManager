const serverModel = require("./ServerModel");


function StartAll() {
  let servers = serverModel.ServerManager().getServerObjects();
  for (let k in servers) {
    let server = servers[k];
    try{
      server.start()
    }catch (err) {
      SQSERVER.error("服务端 "+k+" 启动失败")
    }
  }
  SQSERVER.infoLog("INFO", "***启动全部服务端***");
}

module.exports = {
  StartAll
};
