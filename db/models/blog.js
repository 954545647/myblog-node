// 博客模型
const mongoose = require('mongoose');

const Scheme = mongoose.Schema;

const BlogScheme = new Scheme({
  // 作者
  author:{
    type: String,
    default: ''
  },
  // 文章关键词
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
  versionKey:false
})

module.exports = mongoose.model('blogList',BlogScheme);
