// 博客模型
const mongoose = require('mongoose');

const Scheme = mongoose.Schema;

const BlogScheme = new Scheme({
  // 作者
  author:{
    type: String,
    default: ''
  },
  // 文章状态: 0代表草稿 1代表正式文章
  state:{
    type: Number,
    default:0
  },
  // 文章标题 非草稿拥有属性
  title:{
    type:String,
    default:''
  },
  // 博客的简介
  desc:{
    type: String,
    default:''
  },
  // 文章关键词 非草稿拥有属性
  keyword:{
    type: Array,
    default:''
  },
  // 文章时间
  data:{
    type:String,
    default: Date.now
  },
  OriginalContent:{
    type: String,
    default: ''
  },
  HtmlContent:{
    type: String,
    default: ''
  }
},{
  collection:'blogList',
})

module.exports = mongoose.model('blogList',BlogScheme);
