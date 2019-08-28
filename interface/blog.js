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
const User = require("./../db/models/user.js");
// const CONFIG = require("./../config/session.js"); // session的默认配置
// var session = require("koa-session"); // 这个是帮助koa解析cookie
// app.keys = ["some secret hurr"];
// app.use(session(CONFIG, app));

// koa文件上传模块
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

// 上传图片配置
router.post("/upload", upload.single("file"), async (ctx, next) => {
  let file = ctx.req.file;
  ctx.body = {
    filename: file.filename,
    url: config.imgUrl + "/" + ctx.req.file.filename
  };
});

router.get("/getAllBlog", async (ctx, next) => {
  // 从数据库中查找博客类型为1的,即非草稿
  let blog = await Blog.find({ state: 1 });
  let blogTitles = [];
  blog.forEach(item => {
    blogTitles.push(item.title);
  });
  if (blog) {
    ctx.body = {
      status: 200,
      code: 0,
      blog,
      blogTitles
    };
  } else {
    ctx.body = {
      status: 200,
      code: 1, //数据库为空
      blog: [],
      blogTitles: []
    };
  }
});

// 获取指定博客
router.get("/getBlog", async (ctx, next) => {
  let id = ctx.request.query.id;
  // 如果有关键词则返回指定博客
  let blog;
  blog = await Blog.find({ _id: id });
  ctx.body = {
    code: 0,
    status: 200,
    blog: blog
  };
});

// 保存博客
router.post("/saveBlog", async (ctx, next) => {
  let value = ctx.request.body.value; //markdown语法数据
  let render = ctx.request.body.render; //转换为html语法数据
  let author = ctx.request.body.username; //作者名字
  let keyword = ctx.request.body.keyword; //关键词
  let state = ctx.request.body.state; //博客状态
  let title = ctx.request.body.title; //博客标题
  let desc = ctx.request.body.desc; //博客简介
  let currentTime = new Date(); //博客创建时间
  let year = currentTime.getFullYear();
  let month = String(currentTime.getMonth() + 1).padStart(2, "0");
  let date = String(currentTime.getDate()).padStart(2, "0");
  let time = `${year}-${month}-${date}`;
  let blog = new Blog({
    author: author ? author : "匿名",
    keyword: keyword ? keyword : ["学习"],
    data: time,
    OriginalContent: value,
    HtmlContent: render,
    state: state ? state : 0,
    title: title ? title : "无题",
    desc: desc ? desc : "博客详情点击查看"
  });
  blog.save();
  ctx.body = {
    status: 200,
    blog
  };
});

// 获取系统信息 (博客数量(草稿和正文) 用户数量(超级管理员和普通用户))
router.get("/info", async ctx => {
  let userInfo = {};
  let blogInfo = {};
  await User.find().then(res => {
    userInfo.count = res.length;
    let count = 0;
    res.forEach(item => {
      if (item.role === 0) {
        count++;
      }
    });
    userInfo.superAdmin = res.length - count;
    userInfo.ordinary = count;
  });
  await Blog.find().then(res => {
    blogInfo.count = res.length;
    let count = 0;
    let blogTitles = [];
    // 博客数据
    res.forEach(item => {
      if (item.state === 0) {
        count++;
      }
    });
    blogInfo.draft = count;
    blogInfo.main = res.length - count;
    // 博客标题
    res.forEach((item)=>{
      if(item.state === 1){
        blogTitles.push(item.title)
      }
    })
    blogInfo.blogTitles = blogTitles;
  });
  ctx.body = {
    code: 0,
    status: 200,
    userInfo,
    blogInfo
  };
});

module.exports = router;
