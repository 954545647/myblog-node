const Koa = require("koa");
const app = new Koa();
const router = require('koa-router')();
const cors = require('koa2-cors');
const bodyParser = require('koa-bodyparser');
const user = require('./interface/user.js');
const render = require('koa-art-template');
const path = require('path');
render(app, {
  root: path.join(__dirname, 'views'),
  extname: '.html',
  debug: process.env.NODE_ENV !== 'production'
});

app.use(bodyParser());
app.use(cors());

router.get('/',async(ctx)=>{
  ctx.body='这是首页';
  await ctx.render('index');
})

app.use(user.routes()).use(user.allowedMethods());  //用户路由
app
  .use(router.routes()) // 启动路由
  .use(router.allowedMethods());
app.listen(3000);
