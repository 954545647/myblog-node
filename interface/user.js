// 登录注册接口

// 引用并且实例化koa路由
const Koa = require("koa");
const app = new Koa();
const router = require("koa-router")();
const nodemailer = require("nodemailer"); //发送邮件需要包
const fs = require("fs");
const path = require("path");
const render = require("koa-art-template");
var template = require('art-template');
render(app, {
  root: path.join(__dirname, "views"),
  extname: ".html",
  debug: process.env.NODE_ENV !== "production"
});
// 路由前缀带 /user
router.prefix("/user");
let filePath = path.resolve(__dirname, "./../views/mail.html");
const html = template(filePath,{
  code: '666'
});

router.post("/register", async ctx => {
  let userMail = ctx.request.body.email;
  console.log(userMail);
  let transporter = nodemailer.createTransport({
    // host: 'smtp.ethereal.email',
    service: "qq", // 使用了内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/
    port: 465, // SMTP 端口
    secureConnection: true, // 使用了 SSL
    auth: {
      user: `${userMail}`,
      // 这里密码不是qq密码，是你设置的smtp授权码
      pass: "cdixterherclbbfb"
    }
  });

  let mailOptions = {
    from: '"认证邮件" <954545647@qq.com>', // sender address
    to: "954545647@qq.com", // list of receivers
    subject: "Hello", // Subject line
    // 发送text或者html格式
    // text: 'Hello world?', // plain text body
    // html: '<b>Hello world?</b>' // html body
    // html: fs.createReadStream(path.resolve(__dirname, "./../views/mail.html"))
    html: html
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    // Message sent: <04ec7731-cc68-1ef6-303c-61b0f796b78f@qq.com>
  });
  ctx.body = "这是post请求的数据";
});

module.exports = router;
