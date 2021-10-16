//标准的URL定位器
//如果你的程序不在根目录，可以考虑更改这里，或者你有什么其他姿势。
//如果你需要反向代理加入SSL，请更改此处

//某些 login 页面没有 SQSERVER 全局变量，在此实例化
if (window.SQSERVER == undefined) window.SQSERVER = {};

//Ws 默认协议
SQSERVER.WS_PROTOCOL = "ws://";

//HTTP 默认协议
SQSERVER.HTTP_PROTOCOL = "http://";


//URL定位器
SQSERVER.URL = function (url, protocol) {
  var _protocol = protocol || SQSERVER.HTTP_PROTOCOL;
  var hostName = window.location.host;
  var openURL = hostName + "/" + url;
  return _protocol + openURL;
};
