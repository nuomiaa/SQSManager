const {spawn} = require("child_process");
const iconv = require("iconv-lite");
const EventEmitter = require("events");

const tools = require("../tools");
const permission = require("../../helper/Permission");

const path = require("path");
const serverModel = require("../../model/ServerModel");

const fs = require("fs");

class ServerProcess extends EventEmitter {
  constructor(args) {
    super(args);
    this.dataModel = undefined;
    this.process = undefined;
    this._run = false;
    this._update = false;
    //用于异步进行的锁
    this._loading = false;
  }

  // 自定义命令启动方式
  customCommandStart() {
    //暂时使用 MCSMERVER.log 目前已弃用，下版本 log4js
    SQSERVER.infoLog("Squad Server start", this.dataModel.name);
    SQSERVER.log(["服务器 [", this.dataModel.name, "] 启动进程:"].join(" "));
    SQSERVER.log("-------------------------------");
    SQSERVER.log(["自定义参数启动: ", this.dataModel.highCommande].join(" "));
    SQSERVER.log(["根:", this.dataModel.cwd].join(" "));
    SQSERVER.log("-------------------------------");

    if (!this.dataModel.highCommande || this.dataModel.highCommande.length <= 0) throw new Error("自定义参数非法,无法启动服务端");
    let commandArray = this.dataModel.highCommande.split(" ");
    let javaPath = commandArray.shift();
    //过滤
    let parList = [];
    for (let k in commandArray) {
      if (commandArray[k] == "") continue;
      parList.push(commandArray[k]);
    }

    this.process = spawn(javaPath, parList, this.ProcessConfig);
  }

  // 标准启动方式
  templateStart(onlyCommandString = false) {
    let tmpAddList = [];
    let tmpShouldList = [];

    const SQServer = serverModel.ServerManager().getServer(this.dataModel.name);

    if (!this.dataModel.SQRconConfig.SQRconPassword){
      SQServer.dataModel.SQRconConfig = {
        SQRconPort: randomFrom(30001,40000),
        SQRconPassword: RandomPassword(32, '')
      };
      SQServer.dataModel.save();
    }

    this.dataModel.GamePort && tmpShouldList.push("Port=" + this.dataModel.GamePort);
    this.dataModel.QueryPort && tmpShouldList.push("QueryPort=" + this.dataModel.QueryPort);
    this.dataModel.TickRate && tmpShouldList.push("FIXEDMAXTICKRATE=" + this.dataModel.TickRate);
    this.dataModel.MaxPlayer && tmpShouldList.push("FIXEDMAXPLAYERS=" + this.dataModel.MaxPlayer);

    tmpShouldList.push("RCONPORT="+SQServer.dataModel.SQRconConfig.SQRconPort);
    tmpShouldList.push("RCONPASSWORD="+SQServer.dataModel.SQRconConfig.SQRconPassword);

    tmpAddList = this.dataModel.addCmd.concat(tmpShouldList);

    //过滤
    let parList = [];
    for (let k in tmpAddList) {
      if (tmpAddList[k] == "") continue;
      parList.push(tmpAddList[k]);
    }

    let commandString = parList.toString().replace(/,/gim, " ");

    //是否只获取命令字符串
    if (onlyCommandString) return commandString;

    //暂时使用 MCSMERVER.log 目前已弃用，下版本 log4js
    SQSERVER.log("");
    SQSERVER.log("==============================================================");
    SQSERVER.infoLog("Squad Server start", this.dataModel.name);
    SQSERVER.log(["服务器 [", this.dataModel.name, "] 启动进程"].join(" "));
    SQSERVER.log("--------------------------------------------------------------");
    SQSERVER.log(["启动: ", commandString].join(" "));
    SQSERVER.log(["根:", this.dataModel.cwd].join(" "));
    SQSERVER.log("==============================================================");
    SQSERVER.log("");

    this.process = spawn(this.dataModel.cwd + '/SquadGame/Binaries/Win64/SquadGameServer.exe', parList, this.ProcessConfig);
  }

  // 更新服务器方式
  updateServer() {
    SQSERVER.log();
    SQSERVER.log("==============================================================");
    SQSERVER.infoLog("Squad Server update - ModID:"+this.dataModel.ModID);
    SQSERVER.log(["服务器 [", this.dataModel.name, "] 运行更新程序"].join(" "));
    SQSERVER.log("--------------------------------------------------------------");
    SQSERVER.log(["根:", this.dataModel.cwd].join(" "));
    SQSERVER.log("==============================================================");
    SQSERVER.log();

    if (this.dataModel.type==='mod' && this.dataModel.ModID>10000) {
      this.batName = 'update_mod.bat'
    }else {
      this.batName = 'update.bat'
    }
    let parList = [
      SQSERVER.localProperty.SteamCmd.replace(/\//gim, '\\'),
      this.dataModel.cwd.replace(/\//gim, '\\'),
      this.dataModel.ModID
    ];

    this.process = spawn(process.cwd() + '/update/' + this.batName, parList, this.ProcessConfig);
    this._update = true;
  }

  // 统一服务端开启入口
  // 不论是通过哪种方式启动，必须从这个入口进入，再根据不同配置进行分支
  start(update) {
    // 服务端时间权限判断
    let timeResult = this.isDealLineDate();
    if (timeResult) {
      throw new Error("服务端于 " + this.dataModel.timeLimitDate + " 时间已到期，拒绝启动，请咨询管理员。");
    }
    if (this.dataModel.type==='mod' && this.dataModel.ModID<10000) {
      throw new Error("服务端未设置 ModID - 拒绝启动，请咨询管理员。");
    }

    // 防止重复启动
    if (this._run || this._loading) throw new Error("服务端进程运行中或正在更新...");

    this._loading = true;

    // 选择启动方式 自定义命令与配置启动
    if (!update) {
      // 只在非自定义模式下检查参数
      if (!fs.existsSync(this.dataModel.cwd)) {
        this.stop();
        throw new Error('服务端根目录 "' + this.dataModel.cwd + '" 不存在!');
      }
      if (!fs.existsSync(this.dataModel.cwd + '/SquadGame/Binaries/Win64/SquadGameServer.exe')) {
        this.stop();
        throw new Error('服务端文件不存在，请点击『更新服务端』');
      }
    }

    this.ProcessConfig = {
      cwd: this.dataModel.cwd,
      stdio: "pipe"
    };

    try {
      update ? this.updateServer() : this.templateStart();
    } catch (err) {
      this.stop();
      throw new Error("进程启动时异常:" + err.name + ":" + err.message);
    }

    // 设置启动状态
    this._run = true;
    this._loading = false;
    this.dataModel.lastDate = new Date().toLocaleString();

    // 进程事件监听
    this.process.on("error", (err) => {
      SQSERVER.error("服务器运行时异常,建议检查配置与环境", err);
      this.printlnStdin(["Error:", err.name, "\n Error Message:", err.message, "\n 进程 PID:", this.process.pid || "启动失败，无法获取进程。"]);
      this.stop();
      this.emit("error", err);
    });

    // 进程启动成功确认
    if (!this.process.pid) {
      SQSERVER.error("服务端进程启动失败，建议检查启动命令与参数是否正确，pid:", this.process.pid);
      this.stop();
      delete this.process;
      throw new Error("服务端进程启动失败，建议检查启动命令与参数是否正确");
    }

    // 输出事件的传递
    this.process.stdout.on("data", (data) => this.emit("console", iconv.decode(data, this.dataModel.oe)));
    this.process.stderr.on("data", (data) => this.emit("console", iconv.decode(data, this.dataModel.oe)));
    this.process.on("exit", (code) => {
      this.emit("exit", code);
      this.stop();
    });

    // 产生事件开启
    this.emit("open", this);

    // 输出开服信息
    this.printlnCommandLine("服务端 " + this.dataModel.name + " 执行运行命令.");
    return true;
  }

  // 发送指令
  send(command) {
    if (this._run) {
      if (this.process.dockerContainer != null) {
        this.process.stdin.write(iconv.encode(command, this.dataModel.ie) + "\n");
      } else {
        this.process.stdin.write(iconv.encode(command, this.dataModel.ie));
        this.process.stdin.write("\n");
      }
      return true;
    }
    return true;
  }

  // 重启实例
  restart() {
    if (this._run === true) {
      this.stopServer();
      // 开始计时重启
      let timeCount = 0;
      let timesCan = setInterval(() => {
        if (this._run == false) {
          // 服务器关闭时 3 秒后立即重启
          setTimeout(() => {
            try {
              this.start();
            } catch (err) {
              SQSERVER.error("服务器重启失败:", err);
            }
          }, 3000);
          clearInterval(timesCan);
        }
        //90s 内服务器依然没有关闭，代表出现问题
        if (timeCount >= 90) {
          clearInterval(timesCan);
        }
        timeCount++;
      }, 1000);

      return true;
    }
  }

  // 更新服务器
  update() {
    this._run && this.kill();
    try {
      let l = this
      setTimeout(function () {
        l.start(true);
      },500)
      return true;
    } catch (err) {
      SQSERVER.error("服务器更新失败:", err);
      return false;
    }
  }

  // 这并不是推荐的直接使用方式；
  // stop 方法只适用于本类调用，因为使用此方法不管是否成功停止，都必将进入停止状态；
  // 这样即有可能面板显示已经停止，但进程还在运行的情况；
  // 最好的做法是通过命令来结束。
  stop() {
    this._run = false;
    this._update = false;
    this._loading = false;
  }

  // 通过命令关闭服务器
  stopServer() {
    this.kill()
  }

  // 杀死进程，若是 Docker 进程则是移除容器
  kill() {
    if (this._run) {
      this.process.kill("SIGKILL");
      this._run = false;
      return true;
    }
    return false;
  }

  // 是否运行中
  isRun() {
    return this._run;
  }

  // 是否更新中
  isUpdate() {
    return this._update;
  }

  //输出一行到标准输出
  printlnStdin(line) {
    let str = ["[SQMANAGER] [", tools.getFullTime(), "]:", line, "\r\n"].join(" ");
    this.emit("console", str);
  }

  printlnCommandLine(line) {
    this.emit("console", "[SQMANAGER] -------------------------------------------------------------- \r\n");
    this.printlnStdin(line);
    this.emit("console", "[SQMANAGER] -------------------------------------------------------------- \r\n");
  }

  isDealLineDate() {
    let timeResult = permission.isTimeLimit(this.dataModel.timeLimitDate);
    return timeResult;
  }
}

module.exports = ServerProcess;

function RandomPassword(Len, R) {
  let pasArr = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','0','1','2','3','4','5','6','7','8','9'];
  let password = '';
  Len = Len-R.length;
  for(let i=0, l=pasArr.length; i<Len; i++) {
    let x = Math.floor(Math.random()*l);
    password += pasArr[x];
  }
  password = R + password;
  return String(password);
}

function randomFrom(lowerValue,upperValue) {
  return Math.floor(Math.random() * (upperValue - lowerValue + 1) + lowerValue);
}