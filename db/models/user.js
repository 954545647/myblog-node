// 用户模型
const mongoose = require('mongoose');  // 引用mongoose数据库

const Scheme = mongoose.Schema

// 创建User模型
const UserSchema = new Scheme({
  username:{
    type:String,
    default: ''
  },
  password:{
    type:String,
    require:true
  },
  email:{
    type:String,
    require:true
  },
  // 用户权限
  role:{
    type:Number,
    default:0
  },
  // 用户头像
  cover:{
    type:String,
    default:''
  }
},{
  //默认collection表名是model的第一个参数小写并加上s
  // 这里可以自己手动配置名字
  collection: 'user', 
  versionKey: false // 不需要 __v 字段，默认是加上的
})

// 第一个参数是可以起的别名User
module.exports = mongoose.model('user',UserSchema);