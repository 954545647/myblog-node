const config = {
  key: "koa:sess", //默认
  maxAge: 600, //过期时间
  autoCommit: true, //默认true
  overwrite: true, //覆盖
  httpOnly: true, //true表示只有服务器端可以访问
  signed: true, //默认签名
  rolling: false, //每次访问都重新刷新时间
  renew: false //session快过期的时候重新刷新
};

module.exports = config;