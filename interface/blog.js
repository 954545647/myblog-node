// 博客路由

const koa = require("koa");
const app = new koa();
const router = require("koa-router")();
router.prefix("/blog");
const path = require("path");
const config = require("./../config/config");

// 配置静态资源文件夹
app.use(require("koa-static")("./../uploads"));
// 解析post请求
const bodyParser = require("koa-bodyparser");
app.use(bodyParser());
// 配置mongodb数据库
const Blog = require("./../db/models/blog.js");

// 处理koa文件上传模块
const multer = require("koa-multer");
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
  console.log(config.imgUrl + "/" + ctx.req.file.filename);
  ctx.body = {
    filename: file.filename,
    url: config.imgUrl + "/" + ctx.req.file.filename
  };
});

// 获取博客
router.get('/getBlog',async (ctx,next)=>{
  let keyword = ctx.request.query.keyword
  // 如果有关键词则返回指定博客
  let blog
  if(keyword){
    blog = await Blog.find({keyword: keyword});
  }else{
    blog = await Blog.find()
  }
  ctx.body={
    code:0,
    status:200,
    blog: blog
  }
  // 如果没有关键词则返回全部博客
})

// 保存博客
router.post("/saveBlog", async (ctx, next) => {
  let value = ctx.request.body.value; //markdown语法数据
  let render = ctx.request.body.render; //转换为html语法数据
  let currentTime = new Date();
  let year = currentTime.getFullYear();
  let month = String(currentTime.getMonth() + 1).padStart(2, "0");
  let date = String(currentTime.getDate()).padStart(2, "0");
  let time = `${year}-${month}-${date}`;
  let author = ctx.request.body.username;
  let keyword = ctx.request.body.keyword;
  let blog = new Blog({
    author: author ? author : "rex",
    keyword: keyword ? keyword : ["前端"],
    data: time,
    OriginalContent: value,
    HtmlContent: render
  });
  blog.save();
  ctx.body = 666;
});
module.exports = router;
