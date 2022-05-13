const Gamedig = require('gamedig');

function PingSQServer(port, callback) {
  Gamedig.query({type: 'squad', host: '127.0.0.1', port: port}).then((state) => {
    // console.log(state);
    let on = state.players.length;
    let max = state.maxplayers;
    if (on > max){
      let line = on-max;
      on = max+'(+'+line+')';
    }
    state.current_players = on;
    state.max_players = max;

    for (let p in state.players){
      if (!state.players[p].name || state.players[p].name===undefined) continue;
      if (state.players[p].score===undefined) state.players[p].score=0;
      if (state.players[p].time===undefined) state.players[p].time=0;
      state.players[p].time=SecondToTime(parseInt(state.players[p].time));
    }

    if (state.raw.rules.LicenseId_i>100 && state.raw.rules.LicenseSig1_s && state.raw.rules.LicenseSig2_s && state.raw.rules.LicenseSig3_s){
      state.License = true;
    }else {
      state.License = false;
    }

    callback(state, null);
  }).catch((error) => {
    // console.log("Server is offline");
    callback(null, error);
  });
}

// 任务对象缓存
const TASK_DATABASE = {};
// 任务结果缓存
const SQPING_RESULT_DATABASE = {};
// 任务参数缓存
const TASK_OBJECT_DATABASE = {};

// 当服务器开启时，为其创建一个定时任务
function CreateSQPingTask(id, port) {
  // 若任务存在，禁止重复创建，每个服务器有且只有一个定时查询任务
  if (TASK_DATABASE[id]) {
    return;
  }
  // 任务参数对象，用于记录错误次数和其他数据
  TASK_OBJECT_DATABASE[id] = {
    errorCount: 0
  };
  // 每隔 10 秒，ping 查询一次服务器状态，并且缓存结果
  const taskInterval = setInterval(() => {
    // 进行查询
    // console.log(port)

    PingSQServer(port, (v, e) => {
      // console.log(v)
      if (v != null && e == null) {
        // 查询成功则缓存值
        SQPING_RESULT_DATABASE[id] = v;
      } else {
        // 连续查询错误次数 180 次以上，即 30 分钟，主动销毁自身
        TASK_OBJECT_DATABASE[id] && TASK_OBJECT_DATABASE[id].errorCount++;
        if (TASK_OBJECT_DATABASE[id] && TASK_OBJECT_DATABASE[id].errorCount > 180) DestroySQPingTask(id)
      }
    });
  }, 1000 * 10);
  // 记录定时任务
  TASK_DATABASE[id] = taskInterval;
}

// 当服务器关闭时，为其关闭一个定时任务
function DestroySQPingTask(id) {
  // 清理任务与其缓存
  clearInterval(TASK_DATABASE[id]);
  TASK_DATABASE[id] = undefined;
  SQPING_RESULT_DATABASE[id] = undefined;
  TASK_OBJECT_DATABASE[id] = undefined;
}

function QuerySQPingTask(id) {
  return SQPING_RESULT_DATABASE[id];
}

module.exports = {
  CreateSQPingTask,
  DestroySQPingTask,
  QuerySQPingTask
};

function SecondToTime(Second) {
  let theTime = Second;//秒
  let middle = 0;//分
  let hour = 0;//小时
  if (theTime > 59){
    middle = parseInt(theTime / 60);
    theTime = parseInt(theTime % 60);
  }
  if (middle > 59) {
    hour = parseInt(middle / 60);
    middle = parseInt(middle % 60);
  }
  theTime < 10 ? theTime = '0' + theTime : theTime = theTime
  middle < 10 ? middle = '0' + middle : middle = middle
  hour < 10 ? hour = '0' + hour : hour = hour
  return hour + ':' + middle + ':' + theTime
}