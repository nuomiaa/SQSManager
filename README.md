```
___________________________  ___                                         
__  ___/_  __ \_  ___/__   |/  /_____ _____________ _______ _____________
_____ \_  / / /____ \__  /|_/ /_  __ `/_  __ \  __ `/_  __ `/  _ \_  ___/
____/ // /_/ /____/ /_  /  / / / /_/ /_  / / / /_/ /_  /_/ //  __/  /    
/____/ \___\_\/____/ /_/  /_/  \__,_/ /_/ /_/\__,_/ _\__, / \___//_/     
                                                    /____/           
```

[![Status](https://img.shields.io/badge/npm-v6.14.15-blue.svg)](https://www.npmjs.com/)
[![Status](https://img.shields.io/badge/node-v10.16.0-blue.svg)](https://nodejs.org/en/download/)
[![Status](https://img.shields.io/badge/License-MIT-red.svg)](https://github.com/Suwings/MCSManager)

全中文，简单，易用，多实例，轻量级的 Squad Server 控制面板。

这是一款可以管理多个 Squad Server 服务端（支持群组端）的 Web 管理面板，并且可以分配多个子账号来分别管理不同的 Squad Server 服务端，支持绝大部分主流的服务端，甚至是其他非 Squad Server 的程序。


项目基于 [MCSManager](https://github.com/MCSManager/MCSManager) 8.6 版开发，由 [nuomiaa](https://github.com/nuomiaa) 开发。

<br />


运行环境
-----------

控制面板可运行在 Windows 与 Linux 平台，无需数据库与任何系统配置，只需安装 node 环境即可快速运行，属于轻量级的服务端控制面板。

推荐 `Node 10.16.0` 以上，无需数据库和更改任何系统配置，开箱即可运行。

<br />


配置文件
-----------
配置文件是程序目录下的 `property.js` 文件，它会在你第一次运行的时候，自动生成。

<br />



启动说明
-----------
`运行.bat` 运行面板

`Start.bat` 运行面板并启动所有服务器


<br />



浏览器兼容性
-----------
- `ECMAScript 5` 标准
- `IE 11+` `Chrome` `Firefox` `Safari` `Opera` 等现代主流浏览器

**例外:** 文件在线管理界面需要 `IE 11+` 

<br />

权限系统
-----------
尤其注意的是，为了更加简化面板权限系统，我们只分为两种账号。

`管理账号` 凡是以 # 字符开头的用户，均为管理账号，列如 `#master` `#admin` `#test`

`普通账号` 不以 # 字符开头的用户，列如 `test` `usernameww` `xxx`

普通账号能够管理的服务器只能由管理账号来进行设定，管理账号可以管理任何服务器，并且能管理所有用户。

具体使用，我想你只需要运行就知道，设计的十分简单。

<br />

问题报告
-----------
欢迎发现任何 BUG 及时反馈，必当及时修复。

若发现严重安全漏洞又不便公开发布，请发送邮件至: nuomiaa@gmail.com。

<br />

开源协议
-----------
MIT License
