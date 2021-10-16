const schedule = require("node-schedule");
const DataModel = require("../core/DataModel");
const serverModel = require("../model/ServerModel");

const PATH = "server/schedule/_ schedule _.js";

SQSERVER.Schedule = {};
SQSERVER.Schedule.container = {};
SQSERVER.Schedule.dataModel = new DataModel(PATH);
SQSERVER.Schedule.dataModel.list = [];

//任务具体执行函数
function serverExe(servername, commande) {
  if (commande.length == 0) return;
  try {
    if (commande == "__start__") {
      serverModel.startServer(servername);
      return;
    }
    if (commande == "__stop__") {
      serverModel.stopServer(servername);
      return;
    }
    if (commande == "__restart__") {
      serverModel.restartServer(servername);
      return;
    }
    // 默认执行命令
    serverModel.sendCommand(servername, commande);
  } catch (err) {
    // 默认忽略定时计划任务错误
    // SQSERVER.log("[ Schedule ] [", servername, "] 服务器计划执行时报错 | 已忽略");
  }
}

//计划任务模块初始化
module.exports.init = () => {
  try {
    SQSERVER.Schedule.dataModel.load();
  } catch (err) {
    SQSERVER.Schedule.dataModel.save();
  }
  for (const key in SQSERVER.Schedule.dataModel.list) {
    const element = SQSERVER.Schedule.dataModel.list[key];
    if (element == null) continue;
    createScheduleJobCount(element.id, element.time, element.count, element.commande, element.servername, null, false);
  }
};

//计次型任务
function createScheduleJobCount(id, time, count, commande, servername, callback, _save = true) {
  let lco = 0;
  // eslint-disable-next-line no-unused-vars
  let mask = (SQSERVER.Schedule.container[id] = schedule.scheduleJob(time, (fireDate) => {
    if (lco >= count && count > 0) {
      deleteScheduleJob(id);
      return;
    }
    lco++;
    serverExe(servername, commande);
    callback && callback(commande);
  }));
  if (mask && _save) {
    SQSERVER.Schedule.dataModel.list.push({
      id: id,
      count: count,
      time: time,
      commande: commande,
      servername: servername
    });
  }
  if (_save) SQSERVER.Schedule.dataModel.save();
}
module.exports.createScheduleJobCount = createScheduleJobCount;

//删除
function deleteScheduleJob(id) {
  let mask = SQSERVER.Schedule.container[id] || null;
  SQSERVER.Schedule.container[id] = undefined;
  for (const key in SQSERVER.Schedule.dataModel.list) {
    const element = SQSERVER.Schedule.dataModel.list[key];
    if (element && element.id == id) {
      SQSERVER.Schedule.dataModel.list.splice(key, 1);
      break;
    }
  }
  SQSERVER.Schedule.dataModel.save();
  if (mask) {
    mask.cancel();
  }
}
module.exports.deleteScheduleJob = deleteScheduleJob;
