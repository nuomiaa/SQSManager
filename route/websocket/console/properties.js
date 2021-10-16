const response = require("../../../helper/Response");
var serverModel = require("../../../model/ServerModel");
const permssion = require("../../../helper/Permission");
const { WebSocketObserver } = require("../../../model/WebSocketModel");

// 获取配置
WebSocketObserver().listener("server/properties", (data) => {
    let serverName = data.body.trim();
    if (SQSERVER.localProperty.AccessProtect) {
        if (!permssion.isMaster(data.WsSession)) {
            response.wsMsgWindow(data.ws, "✘ 错误：权限不足，已启用访问保护")
            return
        }
    }
    if (permssion.isCanServer(data.WsSession.username, serverName)) {
        serverModel
            .ServerManager()
            .getServer(serverName)
            .propertiesLoad((properties, err) => {
                if (err) {
                    response.wsMsgWindow(data.ws, "服务器 配置文件 Server.cfg 不存在或读取出错！请关闭服务器并点击『更新服务端』重载文件.");
                    return;
                }
                response.wsSend(data.ws, "server/properties", {
                    run: serverModel.ServerManager().getServer(serverName).isRun(),
                    serverName: serverName,
                    properties: properties
                });
            });
    }
});

// 更新配置
WebSocketObserver().listener("server/properties_update", (data) => {
    let config = JSON.parse(data.body);
    let properties = config.properties;
    if (SQSERVER.localProperty.AccessProtect) {
        if (!permssion.isMaster(data.WsSession)) {
            response.wsMsgWindow(data.ws, "✘ 错误：权限不足，已启用访问保护")
            return
        }
    }
    if (permssion.isCanServer(data.WsSession.username, config.serverName)) {
        try {
            serverModel
                .ServerManager()
                .getServer(config.serverName)
                .propertiesSave(properties, () => {
                    response.wsMsgWindow(data.ws, "服务器 [配置文件] 保存成功");
                });
        } catch (err) {
            SQSERVER.error("服务器 [配置文件] 重读出错", err);
            response.wsMsgWindow(data.ws, "服务器 [配置文件] 重读出错:" + err);
        }
    }
});

// 从文件重新读取
WebSocketObserver().listener("server/properties_update_reload", (data) => {
    let serverName = data.body.trim();
    if (SQSERVER.localProperty.AccessProtect) {
        if (!permssion.isMaster(data.WsSession)) {
            response.wsMsgWindow(data.ws, "✘ 错误：权限不足，已启用访问保护")
            return
        }
    }
    if (permssion.isCanServer(data.WsSession.username, serverName)) {
        try {
            serverModel
                .ServerManager()
                .getServer(serverName)
                .propertiesLoad(() => {
                    //再读一次
                    let properties = serverModel.ServerManager().getServer(serverName).properties;
                    if (properties == undefined) {
                        response.wsMsgWindow(data.ws, "服务器 配置文件 Server.cfg 不存在或读取出错，请关闭服务器并点击『更新服务端』重载文件.");
                        return;
                    }
                    //将数据在来一次，前端路由会动态处理
                    response.wsSend(data.ws, "server/properties", {
                        run: serverModel.ServerManager().getServer(serverName).isRun(),
                        serverName: serverName,
                        properties: properties
                    });
                    //信息框
                    response.wsMsgWindow(data.ws, "服务器 [配置文件] 重读刷新完毕");
                });
        } catch (err) {
            SQSERVER.error("服务器 [配置文件] 保存失败", err);
            response.wsMsgWindow(data.ws, "服务器 [配置文件] 保存失败:" + err);
        }
    }
});

// 删除文件
WebSocketObserver().listener("server/properties_del", (data) => {
    let serverName = data.body.trim();
    if (SQSERVER.localProperty.AccessProtect) {
        if (!permssion.isMaster(data.WsSession)) {
            response.wsMsgWindow(data.ws, "✘ 错误：权限不足，已启用访问保护")
            return
        }
    }
    if (permssion.isCanServer(data.WsSession.username, serverName)) {
        serverModel
            .ServerManager()
            .getServer(serverName)
            .propertiesDel((err) => {
                if (err) {
                    response.wsMsgWindow(data.ws, "服务器 配置文件 Server.cfg 删除失败！");
                    return;
                }
                response.wsSend(data.ws, "server/properties_del", {
                    run: serverModel.ServerManager().getServer(serverName).isRun(),
                    serverName: serverName
                });
            });
    }
});