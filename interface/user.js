// 登录注册接口

// 引用并且实例化koa路由
const Koa = require("koa");
const app = new Koa();
const router = require("koa-router")();
const Config = require("./../config/config.js"); //配置文件信息

const nodemailer = require("nodemailer"); //发送邮件需要包

//解析post请求数据
const bodyParser = require("koa-bodyparser");
app.use(bodyParser());

// 使用redis
const Redis = require("ioredis");
const redis = new Redis(Config.redisConf);

//art-template模版引擎
const path = require("path");
const render = require("koa-art-template");
var template = require("art-template");
render(app, {
  root: path.join(__dirname, "views"),
  extname: ".html",
  debug: process.env.NODE_ENV !== "production"
});

// 路由前缀带 /user
router.prefix("/user");
let filePath = path.resolve(__dirname, "./../views/mail.html");

// mongodb数据库
const User = require("./../db/models/user.js");

// 随机获取随机数
let userMail, code;
function getCode() {
  let arr = "";
  for (var i = 0; i < 5; i++) {
    arr += Math.floor(Math.random() * 9 + 1);
  }
  return arr;
}
// 发送邮件路由
router.post("/sendEmail", async ctx => {
  userMail = ctx.request.body.email; //用户的邮箱
  let code = getCode();
  console.log("验证码是", code);
  // 把验证码保存到redis中去
  redis.set(userMail, code);
  // 设置验证码的过期时间为90s;
  redis.expire(userMail, 90);
  const html = template(filePath, {
    code
  });
  let transporter = nodemailer.createTransport({
    // host: 'smtp.ethereal.email',
    service: "qq", // 使用了内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/
    port: 465, // SMTP 端口
    secureConnection: true, // 使用了 SSL
    auth: {
      user: "954545647@qq.com",
      // 这里密码不是qq密码，是你设置的smtp授权码
      pass: "cdixterherclbbfb"
    }
  });

  let mailOptions = {
    from: '"注册邮件" <954545647@qq.com>', // sender address
    to: `${userMail}`, // list of receivers
    subject: "验证码服务", // Subject line
    // 发送text或者html格式
    // text: 'Hello world?', // plain text body
    // html: fs.createReadStream(path.resolve(__dirname, "./../views/mail.html"))
    html: html
  };

  // send mail with defined transport object
  try {
    await transporter.sendMail(mailOptions);
    ctx.body = {
      code: 0,
      result: "发送成功"
    };
    return;
  } catch (error) {
    ctx.body = {
      code: 1,
      result: "邮箱不存在"
    };
    return;
  }
});

// 注册路由
// 用户通过打开邮箱获得验证码在填写完信息后点击注册
router.post("/register", async ctx => {
  let number = ctx.request.body.code; // 用户填写的验证码
  let email = ctx.request.body.email; // 用户的邮箱 用来判断用户是否已经存在
  let password = ctx.request.body.pass; // 用户的密码
  let username = Math.random()
    .toString(36)
    .slice(-6);
  console.log(username);
  let role = 0; //用户权限
  // 要先判断用户是否已经存在了
  // 查询数据库中email字段值为传入email的数据 find是一个数组,findOne返回一个对象
  let dbUserList = await User.find({ email: email });
  let userList = []; // 数据库中所有email的字段
  dbUserList.forEach(item => {
    userList.push(item.email);
  });
  // 如果数据库中已经存在邮箱
  if (userList.includes(email)) {
    ctx.body = {
      code: 1,
      result: "用户已存在"
    };
    return;
  }
  // 校验验证码
  let num = await redis.get(email); // 从redis中获取用户填写邮箱时发送的验证码
  // 如果用户填写的验证码和redis存储的一致的话就通过验证
  if (!num) {
    ctx.body = {
      code: 1,
      result: "验证码已过期,请重新获取"
    };
    return;
  }
  if (number == num) {
    let user = new User({
      username,
      email,
      password,
      role
    });
    user.save();
    ctx.body = {
      code: 0,
      result: "注册成功"
    };
    return;
  }
  if (number !== num) {
    ctx.body = {
      code: 1,
      result: "验证码不正确"
    };
    return;
  }
});

// 登录路由
router.post("/login", async ctx => {
  let email = ctx.request.body.email;
  let password = ctx.request.body.password;
  let dbUser = await User.findOne({ email: email });
  // 如果数据库找不到数据则代表用户不存在
  if (!dbUser) {
    ctx.body = {
      code: 1,
      result: "用户不存在,请前往注册"
    };
    return;
  }
  // 验证通过
  if (dbUser.password === password) {
    // 如果用户验证通过,通过session去保存一个sessionId,
    // 此sessionId需要唯一标识用户,使用用户的邮箱
    ctx.session.sessionId = email;
    ctx.status = 200;
    ctx.body = {
      status: 200,
      code: 0,
      result: "登录成功",
      username: dbUser.username,
    };
  } else {
    ctx.body = {
      code: 2,
      result: "密码错误,请重新输入"
    };
    return;
  }
});

// 登出
router.get("/logout", async (ctx, next) => {
  // 清空sessionId
  ctx.session.sessionId = "";
  ctx.body = {
    code: ctx.session.sessionId,
    status: 200,
    code: 0
  };
});

// 根据用户权限得到对应路由权限
router.post("/checkRule", async ctx => {
  let email = ctx.request.body.email;
  let userRole;
  let username;
  await User.findOne({ email: email }).then((res)=>{
    userRole = res.role;
    username = res.username;
  });
  let routes = [
    {
      name: "blog",
      alias: "首页",
      icon: "icon-wenzhang1",
      clickName:'goToBlog',
    },
    {
      name: "music",
      alias: "听歌",
      icon: "icon-erji",
      clickName:'goToMusic',
    },
    {
      name: "user",
      alias: "个人中心",
      icon: "icon-yonghu",
      clickName:'goToPerson',
    }
  ];
  if (userRole === 1) {
    routes.splice(1, 0, {
      name: "write",
      alias: "写博客",
      icon: "icon-shuben",
      clickName:'goToWrite',
    });
  }
  ctx.body = {
    code: 0,
    status: 200,
    userRole,
    username,
    routes
  };
});
module.exports = router;
