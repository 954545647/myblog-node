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

router.get("/music", async ctx => {
  let name = ctx.query.name;
  try {
    let result;
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

router.get("/getLyric", async ctx => {
  let lyricList = ctx.request.query["lyric[]"];
  let lyricData = [];
  for (var i = 0; i < lyricList.length; i++) {
    let url = encodeURI(lyricList[i]);
    await axios.get(`${url}`).then(res => {
      lyricData.push(res.data);
    });
  }
  if (lyricData.length > 1) {
    ctx.body = {
      code: 0,
      lyricData
    };
  } else {
    ctx.body = {
      code: 1,
      lyricData:[]
    };
  }
});

module.exports = router;
