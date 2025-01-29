const mongoose = require('mongoose')
const validator=require('validator')
const { validate } = require('./course.model')
const userRoles = require('../utils/userRoles')
const userSchema=new mongoose.Schema({
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        validate:[validator.isEmail,'this field should be an Email']
    },
    password:{
        type:String,
        required:true,
       
    },
    token:{
        type:String,     
    },
    role:{
        type:String,
        enum:[userRoles.USER,userRoles.ADMIN,userRoles.MANAGER],
        default:userRoles.USER
    },
    avatar:{
      type:String,
      default:'uploads/i want.jpg'
    }
})
module.exports=mongoose.model('User',userSchema)