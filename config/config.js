const env = require("./env.js");
let dbs;  // 数据库连接地址
let redisUrl; // redis连接地址
let musicData;  // 音乐数据nginx地址
// 上线模式
if (env === "dev") {
  dbs = "mongodb://127.0.0.1:27017/blog";
  redisUrl = '47.105.52.134';
  musicData = 'http://47.105.52.134:80';
} else if (env === "prod") {
  dbs = "mongodb://47.105.52.134:27017/blog";
  redisUrl = '47.105.52.134';
  musicData = 'http://47.105.52.134:80'
}
let redisConf = {
  host: redisUrl, //安装好的redis服务器地址
  port: 6379, //端口
  prefix: "sam:", //存诸前缀
  ttl: 60 * 60 * 23, //过期时间
  db: 0
}
module.exports = {
  dbs,
  redisUrl,
  redisConf,
  musicData
};
