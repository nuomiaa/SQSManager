const ServerProcess = require("./BaseSQSERVER");
const DataModel = require("../DataModel");
const properties = require("properties");
const fs = require("fs");
const tools = require("../tools");

const SYSTEM_CODE = tools.getSystemCodeing();

class SquadServer extends ServerProcess {
  constructor(name, args) {
    super(args);
    //这是配置文件
    this.dataModel = new DataModel("server/" + name);
    let now = new Date().toLocaleString();

    //以下均为模型默认值
    this.dataModel.name = name; //服务器名字
    this.dataModel.createDate = now; //创建时间
    this.dataModel.lastDate = now; //最后启动时间
    this.dataModel.timeLimitDate = ""; //服务端使用期限，到期自动禁止开服

    //输入 输出 编码
    this.dataModel.ie = SYSTEM_CODE;
    this.dataModel.oe = SYSTEM_CODE;

    this.dataModel.autoRestart = true; //是否自动重启
    this.dataModel.schedule = []; //计划任务配置项目

    this.properties = undefined; //服务端配置表

    // Squad Ping 查询配置项目
    this.dataModel.SQRconConfig = {
      SQRconPort: "",
      SQRconPassword: ""
    };
  }


  //构建服务端配置信息
  builder(args) {
    // console.log(args);

    this.dataModel.addCmd = this.configureParams(args, "addCmd", []);

    this.dataModel.type = this.configureParams(args, "type", "");
    this.dataModel.ModID = this.configureParams(args, "ModID", "");
    this.dataModel.UserQQ = this.configureParams(args, "UserQQ", "");
    this.dataModel.TickRate = this.configureParams(args, "TickRate", "");
    this.dataModel.GamePort = this.configureParams(args, "GamePort", "");
    this.dataModel.QueryPort = this.configureParams(args, "QueryPort", "");
    this.dataModel.MaxPlayer = this.configureParams(args, "MaxPlayer", "");

    this.dataModel.ie = this.configureParams(args, "ie", SYSTEM_CODE);
    this.dataModel.oe = this.configureParams(args, "oe", SYSTEM_CODE);

    this.dataModel.timeLimitDate = this.configureParams(args, "timeLimitDate", "");

    //cwd 是服务端文件，不是控制面板需要的配置
    this.dataModel.cwd = this.configureParams(args, "cwd", SQSERVER.localProperty.ServerDir + this.dataModel.name);

    //自定义参数
    let tmpCommandeStart = this.configureParams(args, "highCommande", "");
    //自定义参数去掉所有两个空格
    tmpCommandeStart = tmpCommandeStart.replace(/ {2}/gim, " ");
    this.dataModel.highCommande = tmpCommandeStart;

    //SQRcon配置
    this.dataModel.SQRconConfig = this.configureParams(args, "SQRconConfig", this.dataModel.SQRconConfig);

    this.propertiesLoad();
  }


  // 修改实例信息
  configureParams(args, key, defval = "") {
    // 根据松散配置（局部修改）和严格配置（整体修改）对应配置不同的优先级
    if (args.modify === true) {
      this.dataModel[key] = args[key] || this.dataModel[key] || defval;
    } else {
      this.dataModel[key] = args[key] || defval;
    }
    return this.dataModel[key];
  }


  load() {
    this.dataModel.load();
    this.builder(this.dataModel);
  }

  save() {
    this.dataModel.save();
  }

  // 读取配置
  propertiesLoad(callback) {
    properties.parse(
      this.dataModel.cwd + "/SquadGame/ServerConfig/Server.cfg",
      {
        path: true
      },
      (err, obj) => {
        //Note: 这里callback似乎会执行两次
        //箭头函数this 并且这个不需要保存到配置文件，所以不应该在datamodel

        try{
          if (obj['//']) delete obj['//'];
          obj['ServerName'] = obj['ServerName'].replace(/"/g,'');
          if (obj['ServerPassword']){
            obj['ServerPassword'] = obj['ServerPassword'].replace(/"/g,'');
          }else {
            obj['ServerPassword'] = '';
          }
        }catch (err) {}

        this.properties = obj;
        callback && callback(this.properties, err);
      }
    );
  }

  // 保存配置
  propertiesSave(newProperties, callback) {
    try{
      if (newProperties['ServerName'].indexOf('CN') === -1) {
        newProperties['ServerName'] = '[CN] ' + newProperties['ServerName'];
      }
      newProperties['ServerName'] = '"' + newProperties['ServerName'] + '"';
      if (newProperties['ServerPassword']) newProperties['ServerPassword'] = '"' + newProperties['ServerPassword'] + '"';
    }catch (e) {}

    // 解析
    let text = properties.stringify(newProperties, {
      separator: "="
    });

    // properties 库自动给等于两边加入了空格，现在去除
    text = text.replace(/ = /gim, "=");

    // 写入数据, 文件不存在会自动创建
    fs.writeFile(this.dataModel.cwd + "/SquadGame/ServerConfig/Server.cfg", text, "utf-8", () => {
      this.propertiesLoad((properties, propertiesError) => {
        callback && callback(properties, propertiesError);
      });
    });
  }

  propertiesDel(callback) {
    // 删除文件
    fs.unlink(this.dataModel.cwd + "/SquadGame/ServerConfig/Server.cfg", (err) => {
      if(err) callback && callback(err);
    });
  }
}

module.exports = SquadServer;
