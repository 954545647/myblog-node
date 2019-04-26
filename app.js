const Koa = require("koa");
const app = new Koa(); //实例化koa
const router = require("koa-router")(); //实例化koa路由

const cors = require("koa2-cors"); //解决跨域
app.use(cors());

const bodyParser = require("koa-bodyparser"); //解析post请求数据
app.use(bodyParser());

const user = require("./interface/user.js"); //模块化路由
const render = require("koa-art-template"); // art-template模版引擎
const path = require("path");

const CONFIG = require("./config/session.js"); // session的默认配置
var session = require("koa-generic-session"); // 这个是帮助koa解析cookie
app.keys = ["some secret hurr"];

app.use(session(CONFIG, app));
const mongoose = require("mongoose"); // 引用mongoose数据库
const User = require("./db/models/user.js");
const Config = require("./config/config.js");
mongoose.connect(
  Config.dbs,
  {
    useNewUrlParser: true
  },
  err => {
    if (err) {
      console.log(err);
    } else {
      console.log("数据库连接成功");
    }
  }
);
const Redis = require("ioredis");
const redis = new Redis(Config.redisConf);

router.get("/", async ctx => {
  ctx.body = "这是首页";
  let data = await User.find({email: '123@qq.com'});
  console.log(data)
});
router.get("/user", async ctx => {
  ctx.body = "这是user";
});

app.use(user.routes()).use(user.allowedMethods()); //用户路由
app
  .use(router.routes()) // 启动路由
  .use(router.allowedMethods());
app.listen(3000);
