// 博客路由

const koa = require("koa");
const app = new koa();
const router = require("koa-router")();
router.prefix("/blog");
const path = require("path");
const config = require("./../config/config");
const multer = require("koa-multer");
app.use(require("koa-static")("./../uploads"));
//配置
var storage = multer.diskStorage({
  //文件保存路径
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, "./../uploads/"));
  },
  //修改文件名称
  filename: function(req, file, cb) {
    var fileFormat = file.originalname.split("."); //以点分割成数组，数组的最后一项就是后缀名
    cb(null, Date.now() + "." + fileFormat[fileFormat.length - 1]);
  }
});
//加载配置
var upload = multer({
  storage: storage
});

router.post("/upload", upload.single("file"), async (ctx, next) => {
  let file = ctx.req.file;
  ctx.body = {
    filename: file.filename,
    url: config.imgUrl + "/" + ctx.req.file.filename
  };
});
module.exports = router;
