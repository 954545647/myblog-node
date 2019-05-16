const Koa = require("koa");
const app = new Koa(); //实例化koa
const router = require("koa-router")(); //实例化koa路由

const bodyParser = require("koa-bodyparser"); //解析post请求数据
app.use(bodyParser());

// 配置静态资源服务器
const path = require("path");
const static = require("koa-static");
const staticPath = "./uploads";
app.use(static(path.join(__dirname, staticPath)));
app.use(static("uploads"));

const user = require("./interface/user.js"); //用户路由
const home = require("./interface/home.js"); // 首页路由
const blog = require("./interface/blog.js"); // 首页路由
// const render = require("koa-art-template"); // art-template模版引擎

const CONFIG = require("./config/session.js"); // session的默认配置
var session = require("koa-session"); // 这个是帮助koa解析cookie
app.keys = ["some secret hurr"];
app.use(session(CONFIG, app));

const mongoose = require("mongoose"); // 引用mongoose数据库
// const User = require("./db/models/user.js");
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
      console.log("数据库连接成功!");
    }
  }
);

const Redis = require("ioredis"); // 连接redis
const redis = new Redis(Config.redisConf);

// 白名单
const whiteUrl = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  'http://47.105.52.134',
];
const myUrl = 'http://www.xuhaojia.cn';
// 解决跨域问题
const cors = require("koa2-cors");
app.use(
  cors({
    origin: function(ctx) {
      if(whiteUrl.includes(ctx.header.origin)){
        return ctx.header.origin
      }else{
        return myUrl
      }
    },
    // origin: [`${Config.whiteUrl}`],
    // exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
    maxAge: 5,
    credentials: true,
    allowMethods: ["GET", "POST", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization", "Accept"]
  })
);

router.get("/", async ctx => {
  ctx.body = "这是首页";
});

router.get("/user", async ctx => {
  ctx.body = "这是用户";
});

app.use(user.routes()).use(user.allowedMethods()); //用户路由
app.use(home.routes()).use(home.allowedMethods()); //首页路由
app.use(blog.routes()).use(blog.allowedMethods()); //博客路由
app
  .use(router.routes()) // 启动路由
  .use(router.allowedMethods());
app.listen(3000);
