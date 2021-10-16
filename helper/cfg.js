const properties = require("properties");
const fs = require("fs");

module.exports = new Object({

    // 读 Admins.cfg 文件
    AdminsLoad: function(File) {
    if (!File) return false;
    let obj = fs.readFileSync(File, "utf-8").replace(/\r\n/gim, '\n').split('\n');
    let Groups = [];
    let Admins = [];
    let Array = [];
    let Temp = {};
    for (let v in obj){
        if (obj[v].indexOf('Group=')===0){
            Array = obj[v].substring(6,obj[v].length).split(':');
            if (Array.length===2 && Array[0] && Array[1]){
                Temp = {};
                Temp.Group = Array[0];
                Temp.Power = Array[1].split(',');
                Groups.push(Temp)
            }
        }

        if (obj[v].indexOf('Admin=')===0){
            let msg = '';
            let l = obj[v].indexOf('//');
            if (l>-1) {
                msg = obj[v].substring(l+2,obj[v].length);
                obj[v] = obj[v].substring(0,l-1);
            }
            Array = obj[v].substring(6,obj[v].length).split(':');
            if (Array.length===2){
                Temp = {};
                Temp.SteamID64 = Array[0]
                Temp.Group = Array[1];
                Temp.Msg = msg;
                Admins.push(Temp)
            }
        }
    }

    let data = {};
    data.Admins = Admins;
    data.Groups = Groups;
    // data.GroupName = getGroupName();
    return data;
},
    // 写 Admins.cfg 文件
    AdminsSave: function(File, Data) {
    if (!File) return false;

    let AdminsData='';
    let AddGroup=[];
    let AddAdmin=[];

    for (let group in Data.Groups){
        let g = Data.Groups[group];
        if (AddGroup.indexOf(g.Group)===-1 && g.Power.length>0) {
            AdminsData += `Group=${g.Group}:${g.Power.join(',')}\n`
        }
        AddGroup.push(g.Group);
    }

    AdminsData += '\n\n';

    for (let admin in Data.Admins){
        let a = Data.Admins[admin];
        if (a.Msg) a.Msg = ' //' + a.Msg;
        if (AddAdmin.indexOf(a.SteamID64)===-1) {
            AdminsData += `Admin=${a.SteamID64}:${a.Group}${a.Msg}\n`;
            AddAdmin.push(a.SteamID64);
        }
    }

    fs.writeFileSync(File, AdminsData, "utf-8");
    return true;
},

    // 读 Bans.cfg 文件
    BansLoad: function(File) {
    if (!File) return false;
    let obj = fs.readFileSync(File, "utf-8").replace(/\r\n/gim, '\n').split('\n');
    let Array = [];
    let Bans = [];
    let Temp = {};
    let Time = Math.round(new Date() / 1000);
    for (let v in obj){
        if (obj[v].indexOf('/')===0) continue;
        let l = obj[v].indexOf('//');
        let msg = '';
        if (l>-1) {
            msg = obj[v].substring(l+2,obj[v].length);
            if (msg === 'Automatic Teamkill Kick') msg = '击杀友军-自动封禁';
            obj[v] = obj[v].substring(0,l-1);
        }
        if (obj[v].indexOf('Banned:') > -1){
            const Array = obj[v].match(/^((.*)( )\[SteamID ([0-9]{17})]|N\/A) Banned:([0-9]{17}):([0-9]{1,10})/);
            if (Array){
                Temp = {};
                if (Array[1] !== 'N/A') Temp.Admin = Array[4]; Temp.AdminName = Array[2];
                Temp.SteamID64 = Array[5];
                Temp.Time = Number(Array[6]);
                Temp.Msg = msg;
                if (Temp.Time > Time || Temp.Time === 0) Bans.push(Temp)
            }
        }else {
            Array = obj[v].split(':');
            if (Array.length===2){
                Temp = {};
                Temp.SteamID64 = Array[0];
                Temp.Time = Number(Array[1]);
                Temp.Msg = msg;
                if (Temp.Time > Time || Temp.Time === 0) Bans.push(Temp)
            }
        }
    }
    function sortData(a, b) {
        if (b.Time===0) {
            return b.Time - a.Time
        }else {
            return a.Time - b.Time
        }
    }
    Bans.sort(sortData)
    return Bans;
},
    // 写 Bans.cfg 文件
    BansSave: function(File, Data) {
    if (!File) return false;

    let BansData='';
    let AddBan=[];

    function sortData(a, b) {
        if (b.Time===0) {
            return b.Time - a.Time
        }else {
            return a.Time - b.Time
        }
    }
    Data.sort(sortData)

    for (let i in Data){
        let a = Data[i];
        if (a.Msg) a.Msg = ' //' + a.Msg;
        if (AddBan.indexOf(a.SteamID64) !== -1) continue;
        if (a.Admin || a.AdminName){
            BansData += `${a.AdminName} [SteamID ${a.Admin}] Banned:${a.SteamID64}:${a.Time}${a.Msg}\n`;
        }else {
            BansData += `${a.SteamID64}:${a.Time}${a.Msg}\n`;
        }
        AddBan.push(a.SteamID64);
    }

    fs.writeFileSync(File, BansData+"\n", "utf-8");
    return true;
},

    // 读文件
    Load: function(File) {
    if (!File) return false;
    return fs.readFileSync(File, "utf-8").replace(/\r\n/gim, '\n');
},
    // 写文件
    Save: function(File, Data) {
    if (!File) return false;
    fs.writeFileSync(File, Data, "utf-8");
    return true;
}

});