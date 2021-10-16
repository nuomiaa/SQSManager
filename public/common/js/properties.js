(function () {
  SQSERVER.findPropertiesShow = function (key) {
    var SuwingsLoveYou = {
      // Squad
      "ServerName":"服务器名称",
      "MaxPlayers":"最大玩家人数",
      "ServerPassword":"服务器密码",
      "NumReservedSlots":"预留位人数",
      "IsLANMatch":"仅允许局域网加入",
      "ShouldAdvertise":"社区服务器",
      "NumPlayersDiffForTeamChanges":"阵营平衡人数",
      "AllowTeamChanges":"允许更换阵营",
      "PreventTeamChangeIfUnbalanced":"阵营玩家人数不平衡，禁止更换阵营",
      "EnforceTeamBalance":"更换地图时自动平衡阵营人数",
      "RejoinSquadDelayAfterKick":"更换阵营延迟时间（秒）",
      "RecordDemos":"录制演示 (已弃用)",
      "ServerMessageInterval":"红字公告循环时间间隔（秒）",
      "PublicQueueLimit":"限制排队人数",
      "TKAutoKickEnabled":"击杀友军-自动封禁",
      "VehicleKitRequirementDisabled":"关闭兵种限制",
      "VehicleClaimingDisabled":"关闭载具认证",
      "AllowQA":"允许QA",
      "AllowDevProfiling":"允许开发人员分析",
      "AllowCommunityAdminAccess":"允许社区管理员访问",
      "MapRotationMode":"地图循环模式",
      "RandomizeAtStart":"启动服务器首张地图随机",
      "UseVoteFactions":"阵营投票",
      "UseVoteLevel":"地图投票",
      "UseVoteLayer":"模式投票",
      "AutoTKBanNumberTKs":"击杀友军-自动封禁阈值",
      "AutoTKBanTime":"击杀友军-自动封禁时间（分）",
      "AllowPublicClientsToRecord":"允许客户端录制"
    };

    if (SuwingsLoveYou.hasOwnProperty(key)) {
      return SuwingsLoveYou[key];
    } else {
      //Not find, Return space
      return " ";
    }
  };
})();
