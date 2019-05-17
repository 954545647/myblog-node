const nodemailer = require('nodemailer');
const fs  = require('fs');
const path = require('path');
let transporter = nodemailer.createTransport({
  // host: 'smtp.ethereal.email',
  service: 'qq', // 使用了内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/
  // port: 465, // SMTP 端口
  // secureConnection: true, // 使用了 SSL
  auth: {
    user: '954545647@qq.com',
    // 这里密码不是qq密码，是你设置的smtp授权码
    pass: 'cdixterherclbbfb',
  }
});

let mailOptions = {
  from: '"认证邮件" <954545647@qq.com>', // sender address
  to: '954545647@qq.com', // list of receivers
  subject: 'Hello', // Subject line
  html: fs.createReadStream(path.resolve(__dirname, 'email.html')) 
};

// send mail with defined transport object
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.log(error);
  }
  // Message sent: <04ec7731-cc68-1ef6-303c-61b0f796b78f@qq.com>
});