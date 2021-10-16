const { WebSocketObserver } = require("../../model/WebSocketModel");
const serverModel = require('../../model/ServerModel');
const permssion = require("../../helper/Permission");
const response = require("../../helper/Response");
const cfg = require("../../helper/cfg");

//读取 Admins.cfg 文件
WebSocketObserver().listener("config/admins", (data) => {
  let UserName = data.WsSession.username;
  let ServerName = data.body;

  if (permssion.isCanServer(UserName, ServerName)) {
    let AdminsData;
    try {
      AdminsData = cfg.AdminsLoad(serverModel.ServerManager().getServer(ServerName).dataModel["cwd"] + '/SquadGame/ServerConfig/Admins.cfg');
    } catch (e) {
      response.wsMsgWindow(data.ws, "✘ 错误：Admins.cfg 读取失败");
    }
    response.wsSend(data.ws, "config/admins", {
      username: UserName,
      servername: ServerName,
      AdminsData: AdminsData || {Admins:[],Groups:[]}
    });
  }
});

//保存 Admins.cfg 文件
WebSocketObserver().listener("config/admins_save", (data) => {
  let UserName = data.WsSession.username;
  let obj = JSON.parse(data.body) || {};

  if (permssion.isCanServer(UserName, obj.ServerName)) {
    try {
      cfg.Save(serverModel.ServerManager().getServer(obj.ServerName).dataModel["cwd"] + '/SquadGame/ServerConfig/Admins.cfg', obj.data);
      response.wsMsgWindow(data.ws, "✔ Admins.cfg 导入成功");
    } catch (e) {
      response.wsMsgWindow(data.ws, "✘ 错误：Admins.cfg 导入失败");
    }
  }
});

//Admins.cfg | 新增/保存 权限组
WebSocketObserver().listener("config/admins_add_group", (data) => {
  let username = data.WsSession.username
  let obj = JSON.parse(data.body) || {}
  let info = '新增';

  if (permssion.isCanServer(username, obj.servername || '')) {
    let File = serverModel.ServerManager().getServer(obj.servername).dataModel["cwd"] + '/SquadGame/ServerConfig/Admins.cfg';
    let AdminsData = {Admins:[],Groups:[]}
    try {
      AdminsData = cfg.AdminsLoad(File)
    } catch (e) {}
    try {
      for (let i in AdminsData.Groups) {
        if (AdminsData.Groups[i].Group===obj.data.Group) {
          AdminsData.Groups[i] = obj.data
          info = '修改'
          break
        }
      }
      if (info!=='修改') AdminsData.Groups.unshift(obj.data)
      cfg.AdminsSave(File, AdminsData)
      response.wsMsgWindow(data.ws, `✔ ${info}权限组『${obj.data.Group}』`)
    } catch (err) {
      response.wsMsgWindow(data.ws, `✘ 错误：权限组 ${info}失败`)
    }
  }
});

//Admins.cfg | 删除 权限组
WebSocketObserver().listener("config/admins_del_group", (data) => {
  let username = data.WsSession.username;
  let obj = JSON.parse(data.body) || {};

  if (permssion.isCanServer(username, obj.ServerName || '')) {
    let File = serverModel.ServerManager().getServer(obj.ServerName).dataModel["cwd"] + '/SquadGame/ServerConfig/Admins.cfg';
    let AdminsData = {Admins:[],Groups:[]};
    try {
      AdminsData = cfg.AdminsLoad(File);
    } catch (e) {}
    try {
      for (let i in AdminsData.Groups) {
        if (AdminsData.Groups[i].Group===obj.GroupName) {
          delete AdminsData.Groups[i];
          cfg.AdminsSave(File, AdminsData);
          response.wsMsgWindow(data.ws, `✔ 删除权限组『${obj.GroupName}』`);
          return;
        }
      }
    } catch (err) {
      response.wsMsgWindow(data.ws, '✘ 错误：权限组 删除失败');
    }
  }
});

//Admins.cfg | 添加/保存 管理员
WebSocketObserver().listener("config/admins_add", (data) => {
  let username = data.WsSession.username;
  let obj = JSON.parse(data.body) || {};
  let info = '添加';

  if (permssion.isCanServer(username, obj.servername || '')) {
    let File = serverModel.ServerManager().getServer(obj.servername).dataModel["cwd"] + '/SquadGame/ServerConfig/Admins.cfg';
    let AdminsData = {Admins:[],Groups:[]};
    try {
      AdminsData = cfg.AdminsLoad(File);
    } catch (e) {}
    try {
      for (let i in AdminsData.Admins) {
        if (AdminsData.Admins[i].SteamID64===obj.data.SteamID64) {
          AdminsData.Admins[i] = obj.data;
          info = '修改';
        }
      }
      if (info!=='修改') AdminsData.Admins.unshift(obj.data);
      cfg.AdminsSave(File, AdminsData);
      response.wsMsgWindow(data.ws, `✔ ${info}管理员『${obj.data.SteamID64}』`);
    } catch (err) {
      response.wsMsgWindow(data.ws, `✘ 错误：管理员 ${info}失败`);
    }
  }
});

//Admins.cfg | 删除 管理员
WebSocketObserver().listener("config/admins_del", (data) => {
  let username = data.WsSession.username;
  let obj = JSON.parse(data.body) || {};
  if (permssion.isCanServer(username, obj.ServerName || '')) {
    let File = serverModel.ServerManager().getServer(obj.ServerName).dataModel["cwd"] + '/SquadGame/ServerConfig/Admins.cfg';
    let AdminsData = {Admins:[],Groups:[]};
    try {
      AdminsData = cfg.AdminsLoad(File);
    } catch (e) {}
    try {
      for (let i in AdminsData.Admins) {
        if (AdminsData.Admins[i].SteamID64===obj.SteamID64) {
          delete AdminsData.Admins[i];
          cfg.AdminsSave(File, AdminsData);
          response.wsMsgWindow(data.ws, `✔ 删除管理员『${obj.SteamID64}』`);
          return;
        }
      }
    } catch (err) {
      response.wsMsgWindow(data.ws, '✘ 错误：管理员 删除失败');
    }
  }
});


/**********************************************************************************************************************/


//读取 Bans.cfg 文件
WebSocketObserver().listener("config/bans", (data) => {
  let UserName = data.WsSession.username;
  let ServerName = data.body;

  if (permssion.isCanServer(UserName, ServerName)) {
    let BansData;
    try {
      BansData = cfg.BansLoad(serverModel.ServerManager().getServer(ServerName).dataModel["cwd"] + '/SquadGame/ServerConfig/Bans.cfg');
    } catch (e) {
      response.wsMsgWindow(data.ws, "✘ 错误：Bans.cfg 读取失败");
    }
    response.wsSend(data.ws, "config/bans", {
      username: UserName,
      servername: ServerName,
      BansData: BansData || []
    });
  }
});

//保存 Bans.cfg 文件
WebSocketObserver().listener("config/bans_save", (data) => {
  let UserName = data.WsSession.username;
  let obj = JSON.parse(data.body) || {};

  if (permssion.isCanServer(UserName, obj.ServerName)) {
    try {
      cfg.Save(serverModel.ServerManager().getServer(obj.ServerName).dataModel["cwd"] + '/SquadGame/ServerConfig/Bans.cfg', obj.data);
      response.wsMsgWindow(data.ws, "✔ Bans.cfg 导入成功");
    } catch (e) {
      response.wsMsgWindow(data.ws, "✘ 错误：Bans.cfg 导入失败");
    }
  }
});

//Bans.cfg | 添加/保存 封禁玩家
WebSocketObserver().listener("config/bans_add", (data) => {
  let username = data.WsSession.username;
  let obj = JSON.parse(data.body) || {};
  let info = '添加';
  obj.data.Time=Number(obj.data.Time)

  if (permssion.isCanServer(username, obj.servername || '')) {
    let File = serverModel.ServerManager().getServer(obj.servername).dataModel["cwd"] + '/SquadGame/ServerConfig/Bans.cfg';
    let BansData = [];
    try {
      BansData = cfg.BansLoad(File);
    } catch (e) {}
    try {
      for (let i in BansData) {
        if (BansData[i].SteamID64===obj.data.SteamID64) {
          BansData[i] = obj.data
          info = '修改';
        }
      }
      if (info!=='修改') BansData.unshift(obj.data);
      cfg.BansSave(File, BansData);
      response.wsMsgWindow(data.ws, `✔ ${info}封禁玩家『${obj.data.SteamID64}』`);
    } catch (e) {
      response.wsMsgWindow(data.ws, `✘ 错误：封禁玩家 ${info}失败`);
    }
  }
});

//Bans.cfg | 删除 封禁玩家
WebSocketObserver().listener("config/bans_del", (data) => {
  let username = data.WsSession.username;
  let obj = JSON.parse(data.body) || {};
  if (permssion.isCanServer(username, obj.ServerName || '')) {
    let File = serverModel.ServerManager().getServer(obj.ServerName).dataModel["cwd"] + '/SquadGame/ServerConfig/Bans.cfg';
    let BansData = [];
    try {
      BansData = cfg.BansLoad(File);
    } catch (e) {}
    try {
      for (let i in BansData) {
        if (BansData[i].SteamID64===obj.SteamID64) {
          delete BansData[i];
          cfg.BansSave(File, BansData);
          response.wsMsgWindow(data.ws, `✔ 删除封禁玩家『${obj.SteamID64}』`);
          return;
        }
      }
    } catch (err) {
      response.wsMsgWindow(data.ws, '✘ 错误：封禁玩家 删除失败');
    }
  }
});


/**********************************************************************************************************************/


//读取 MOTD.cfg 文件
WebSocketObserver().listener("config/motd", (data) => {
  let UserName = data.WsSession.username;
  let ServerName = data.body;

  if (permssion.isCanServer(UserName, ServerName)) {
    let MOTDData;
    try {
      MOTDData = cfg.Load(serverModel.ServerManager().getServer(ServerName).dataModel["cwd"] + '/SquadGame/ServerConfig/MOTD.cfg')
          .replace(/&lt;/gim, "<")
          .replace(/&gt;/gim, ">")
          .replace(/&quot;/gim, '"')
          .replace(/&apos;/gim, "'")
          .replace(/&nbsp;/gim, " ")
          .replace(/&amp;/gim, "&");
    } catch (e) {}
    response.wsSend(data.ws, "config/motd", {
      username: UserName,
      servername: ServerName,
      MOTDData: MOTDData || ''
    });
  }
});

//保存 MOTD.cfg 文件
WebSocketObserver().listener("config/motd_save", (data) => {
  let UserName = data.WsSession.username;
  let obj = JSON.parse(data.body) || {};

  if (permssion.isCanServer(UserName, obj.ServerName)) {
    try {
      cfg.Save(serverModel.ServerManager().getServer(obj.ServerName).dataModel["cwd"] + '/SquadGame/ServerConfig/MOTD.cfg', obj.data);
      response.wsMsgWindow(data.ws, "✔ MOTD.cfg 保存成功");
    } catch (e) {
      response.wsMsgWindow(data.ws, "✘ 错误：MOTD.cfg 保存失败");
    }
  }
});


/**********************************************************************************************************************/


//读取 License.cfg 文件
WebSocketObserver().listener("config/license", (data) => {
  let UserName = data.WsSession.username;
  let ServerName = data.body;

  if (SQSERVER.localProperty.AccessProtect) {
    if (!permssion.isMaster(data.WsSession)) {
      response.wsMsgWindow(data.ws, "✘ 错误：权限不足，已启用访问保护")
      return
    }
  }
  if (serverModel.ServerManager().getServer(ServerName).dataModel.type != 'pure') {
    response.wsMsgWindow(data.ws, "✘ 错误：权限不足，模组服务器不可安装许可证")
    return
  }

  if (permssion.isCanServer(UserName, ServerName)) {
    let LicenseData;
    try {
      LicenseData = cfg.Load(serverModel.ServerManager().getServer(ServerName).dataModel["cwd"] + '/SquadGame/ServerConfig/License.cfg');
    } catch (e) {}
    response.wsSend(data.ws, "config/license", {
      username: UserName,
      servername: ServerName,
      LicenseData: LicenseData || ''
    });
  }
});

//保存 License.cfg 文件
WebSocketObserver().listener("config/license_save", (data) => {
  let UserName = data.WsSession.username;
  let obj = JSON.parse(data.body) || {};

  if (SQSERVER.localProperty.AccessProtect) {
    if (!permssion.isMaster(data.WsSession)) {
      response.wsMsgWindow(data.ws, "✘ 错误：权限不足，已启用访问保护")
      return
    }
  }
  if (serverModel.ServerManager().getServer(obj.ServerName).dataModel.type != 'pure') {
    response.wsMsgWindow(data.ws, "✘ 错误：权限不足，模组服务器不可安装许可证")
    return
  }

  if (permssion.isCanServer(UserName, obj.ServerName)) {
    try {
      cfg.Save(serverModel.ServerManager().getServer(obj.ServerName).dataModel["cwd"] + '/SquadGame/ServerConfig/License.cfg', obj.data);
      response.wsMsgWindow(data.ws, "✔ License.cfg 保存成功");
    } catch (e) {
      response.wsMsgWindow(data.ws, "✘ 错误：License.cfg 保存失败");
    }
  }
});


/**********************************************************************************************************************/


//读取 LayerRotation.cfg|LevelRotation.cfg 文件
WebSocketObserver().listener("config/maps", (data) => {
  let UserName = data.WsSession.username;
  let ServerName = data.body;

  if (permssion.isCanServer(UserName, ServerName)) {
    let MapsData = {Layer:'', Level:''};
    let cwd = serverModel.ServerManager().getServer(ServerName).dataModel["cwd"];
    try {
      MapsData.Layer = cfg.Load(cwd + '/SquadGame/ServerConfig/LayerRotation.cfg').replace(/\r\n/gim, '\n');
      MapsData.Level = cfg.Load(cwd + '/SquadGame/ServerConfig/LevelRotation.cfg').replace(/\r\n/gim, '\n');
    } catch (e) {}
    response.wsSend(data.ws, "config/maps", {
      username: UserName,
      servername: ServerName,
      MapsData: MapsData || {Layer:'', Level:''}
    });
  }
});

//保存 LayerRotation.cfg|LevelRotation.cfg 文件
WebSocketObserver().listener("config/maps_save", (data) => {
  let UserName = data.WsSession.username;
  let obj = JSON.parse(data.body) || {};

  if (permssion.isCanServer(UserName, obj.ServerName)) {
    let cwd = serverModel.ServerManager().getServer(obj.ServerName).dataModel["cwd"];
    try {
      cfg.Save(cwd + '/SquadGame/ServerConfig/LayerRotation.cfg', obj.data.Layer);
      cfg.Save(cwd + '/SquadGame/ServerConfig/LevelRotation.cfg', obj.data.Level);
      response.wsMsgWindow(data.ws, "✔ [地图池] 保存成功");
    } catch (e) {
      response.wsMsgWindow(data.ws, "✘ 错误：[地图池] 保存失败");
      console.log(e)
    }
  }
});


/**********************************************************************************************************************/


//读取 ServerMessages.cfg 文件
WebSocketObserver().listener("config/msgs", (data) => {
  let UserName = data.WsSession.username;
  let ServerName = data.body;

  if (permssion.isCanServer(UserName, ServerName)) {
    let MsgsData;
    try {
      MsgsData = cfg.Load(serverModel.ServerManager().getServer(ServerName).dataModel["cwd"] + '/SquadGame/ServerConfig/ServerMessages.cfg').replace(/\r\n/gim, '\n');
    } catch (e) {}
    response.wsSend(data.ws, "config/msgs", {
      username: UserName,
      servername: ServerName,
      MsgsData: MsgsData || ''
    });
  }
});

//保存 ServerMessages.cfg 文件
WebSocketObserver().listener("config/msgs_save", (data) => {
  let UserName = data.WsSession.username;
  let obj = JSON.parse(data.body) || {};

  if (permssion.isCanServer(UserName, obj.ServerName)) {
    try {
      cfg.Save(serverModel.ServerManager().getServer(obj.ServerName).dataModel["cwd"] + '/SquadGame/ServerConfig/ServerMessages.cfg', obj.data);
      response.wsMsgWindow(data.ws, "✔ ServerMessages.cfg 保存成功");
    } catch (e) {
      response.wsMsgWindow(data.ws, "✘ 错误：ServerMessages.cfg 保存失败");
    }
  }
});



/**********************************************************************************************************************/


//读取 RemoteListHosts.cfg 文件
WebSocketObserver().listener("config/remote", (data) => {
  let UserName = data.WsSession.username;
  let ServerName = data.body;

  if (permssion.isCanServer(UserName, ServerName)) {
    let AdminList,BanList;
    try {
      AdminList = cfg.Load(serverModel.ServerManager().getServer(ServerName).dataModel["cwd"] + '/SquadGame/ServerConfig/RemoteAdminListHosts.cfg').replace(/\r\n/gim, '\n');
      BanList = cfg.Load(serverModel.ServerManager().getServer(ServerName).dataModel["cwd"] + '/SquadGame/ServerConfig/RemoteBanListHosts.cfg').replace(/\r\n/gim, '\n');
    } catch (e) {}
    response.wsSend(data.ws, "config/remote", {
      username: UserName,
      servername: ServerName,
      AdminList: AdminList || '',
      BanList: BanList || ''
    });
  }
});

//保存 RemoteListHosts.cfg 文件
WebSocketObserver().listener("config/remote_save", (data) => {
  let UserName = data.WsSession.username;
  let obj = JSON.parse(data.body) || {};

  if (permssion.isCanServer(UserName, obj.ServerName)) {
    try {
      cfg.Save(serverModel.ServerManager().getServer(obj.ServerName).dataModel["cwd"] + '/SquadGame/ServerConfig/RemoteAdminListHosts.cfg', obj.AdminList);
      cfg.Save(serverModel.ServerManager().getServer(obj.ServerName).dataModel["cwd"] + '/SquadGame/ServerConfig/RemoteBanListHosts.cfg', obj.BanList);
      response.wsMsgWindow(data.ws, "✔ RemoteListHosts.cfg 保存成功");
    } catch (e) {
      response.wsMsgWindow(data.ws, "✘ 错误：RemoteListHosts.cfg 保存失败");
    }
  }
});


/**********************************************************************************************************************/


//读取 VoteConfig.cfg 文件
WebSocketObserver().listener("config/vote", (data) => {
  let UserName = data.WsSession.username;
  let ServerName = data.body;

  if (permssion.isCanServer(UserName, ServerName)) {
    let VoteData;
    try {
      VoteData = cfg.Load(serverModel.ServerManager().getServer(ServerName).dataModel["cwd"] + '/SquadGame/ServerConfig/VoteConfig.cfg').replace(/\r\n/gim, '\n');
    } catch (e) {}
    response.wsSend(data.ws, "config/vote", {
      username: UserName,
      servername: ServerName,
      VoteData: VoteData || ''
    });
  }
});

//保存 VoteConfig.cfg 文件
WebSocketObserver().listener("config/vote_save", (data) => {
  let UserName = data.WsSession.username;
  let obj = JSON.parse(data.body) || {};

  if (permssion.isCanServer(UserName, obj.ServerName)) {
    try {
      cfg.Save(serverModel.ServerManager().getServer(obj.ServerName).dataModel["cwd"] + '/SquadGame/ServerConfig/VoteConfig.cfg', obj.data);
      response.wsMsgWindow(data.ws, "✔ VoteConfig.cfg 保存成功");
    } catch (e) {
      response.wsMsgWindow(data.ws, "✘ 错误：VoteConfig.cfg 保存失败");
    }
  }
});


/**********************************************************************************************************************/


//读取 Excluded*.cfg 文件
WebSocketObserver().listener("config/excluded", (data) => {
  let UserName = data.WsSession.username;
  let ServerName = data.body;

  if (permssion.isCanServer(UserName, ServerName)) {
    let Excluded = {Factions:'', FactionSetups:'', Layers:'', Levels:''};
    let cwd = serverModel.ServerManager().getServer(ServerName).dataModel["cwd"];
    try {
      Excluded.Factions = cfg.Load(cwd + '/SquadGame/ServerConfig/ExcludedFactions.cfg').replace(/\r\n/gim, '\n');
      Excluded.FactionSetups = cfg.Load(cwd + '/SquadGame/ServerConfig/ExcludedFactionSetups.cfg').replace(/\r\n/gim, '\n');
      Excluded.Layers = cfg.Load(cwd + '/SquadGame/ServerConfig/ExcludedLayers.cfg').replace(/\r\n/gim, '\n');
      Excluded.Levels = cfg.Load(cwd + '/SquadGame/ServerConfig/ExcludedLevels.cfg').replace(/\r\n/gim, '\n');
    } catch (e) {}
    response.wsSend(data.ws, "config/excluded", {
      username: UserName,
      servername: ServerName,
      ExcludedData: Excluded || {Factions:'', FactionSetups:'', Layers:'', Levels:''}
    });
  }
});

//保存 Excluded*.cfg 文件
WebSocketObserver().listener("config/excluded_save", (data) => {
  let UserName = data.WsSession.username;
  let obj = JSON.parse(data.body) || {};

  if (permssion.isCanServer(UserName, obj.ServerName)) {
    let cwd = serverModel.ServerManager().getServer(obj.ServerName).dataModel["cwd"];
    try {
      cfg.Save(cwd + '/SquadGame/ServerConfig/ExcludedFactions.cfg', obj.data.Factions);
      cfg.Save(cwd + '/SquadGame/ServerConfig/ExcludedFactionSetups.cfg', obj.data.FactionSetups);
      cfg.Save(cwd + '/SquadGame/ServerConfig/ExcludedLayers.cfg', obj.data.Layers);
      cfg.Save(cwd + '/SquadGame/ServerConfig/ExcludedLevels.cfg', obj.data.Levels);
      response.wsMsgWindow(data.ws, "✔ [屏蔽地图] 保存成功");
    } catch (e) {
      response.wsMsgWindow(data.ws, "✘ 错误：[屏蔽地图] 保存失败");
      console.log(e)
    }
  }
});