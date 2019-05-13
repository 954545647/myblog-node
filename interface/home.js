// 首页路由

const Koa = require("koa");
const app = new Koa();
const router = require("koa-router")();
const Config = require("./../config/config.js"); //配置文件信息
const axios = require("axios");
//解析post请求数据
const bodyParser = require("koa-bodyparser");
app.use(bodyParser());
router.prefix("/home");

// 获取音乐数据接口(music.json文件)
router.get("/music", async ctx => {
  try {
    let result;
    // 发起请求,去获取json文件的地址
    await axios.get(`${Config.musicData}/music/music.json`).then(res => {
      result = res.data;
    });
    ctx.body = {
      status: 200,
      result
    };
  } catch (error) {
    ctx.body = {
      code: 1
    };
  }
});

// 获取歌词接口
router.get("/getLyric", async ctx => {
  // 服务器上的歌词链接组成的数组
  let lyricList = ctx.request.query["lyric[]"];
  let lyricData = [];
  let times = []; // 歌词的时间
  let lyric = []; // 纯歌词数据
  let timesResult = []; //存放每首歌的时间
  let lyricResult = []; //存放每首歌的歌词
  const timeReg = /\[(\d*:\d*\.\d*)\]/;
  for (var i = 0; i < lyricList.length; i++) {
    let url = encodeURI(lyricList[i]);
    await axios.get(`${url}`).then(res => {
      let data = res.data.split("\n"); //[00:00.24]与我常在 - 陈奕迅
      data.forEach((item, index) => {
        // 获取相应的歌词
        let lrc = item.split("]")[1];
        // 剔除空字符串
        if (!lrc || lrc.length === 1 || lrc === undefined) return true;
        lyric.push(lrc);
        // 要把每段歌词的时间转换成秒数
        let res = timeReg.exec(item);
        if (res == null) return true;
        let timeStr = res[1];
        var timeStr2 = timeStr.split(":");
        let min = parseInt(timeStr2[0]) * 60;
        let sec = parseFloat(timeStr2[1]);
        let time = parseFloat(Number(min + sec).toFixed(2));
        times.push(time);
      });
      // 这是所有数据
      lyricData.push(res.data);
    });
    // 这是时间数据
    timesResult.push(times);
    // 歌词数据
    lyricResult.push(lyric);
    // 每次遍历完之后都要把 times和lyric清空,不然叠加了
    times = [];
    lyric = [];
  }
  if (lyricData.length > 1) {
    ctx.body = {
      code: 0,
      lyricData,
      lyricResult,
      timesResult
    };
  } else {
    ctx.body = {
      code: 1,
      lyricData: [],
      lyricResult:[],
      timesResult:[]
    };
  }
});

module.exports = router;
