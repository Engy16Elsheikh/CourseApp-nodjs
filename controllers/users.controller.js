const asyncWrapper = require("../middleware/asyncWrapper")
require('dotenv').config()
const User = require('../models/user.model')
const appError = require("../utils/appError")
const httpServerText = require('../utils/httpServerText')
const bcrypt = require('bcryptjs')
const jwt=require('jsonwebtoken')
const generateJWT = require("../utils/generateJWT")
const getAllUsers = asyncWrapper(async (req, res) => {
  const query = req.query
  const limit = query.limit || 10;
  const page = query.page || 1;
  const skip = (page - 1) * limit
  const users = await User.find({}, { "__v": false }).limit(limit).skip(skip)
  res.json({ status: httpServerText.SUCCESS, data: { users } })
})
const register = asyncWrapper(async (req, res, next) => {
  const { firstName, lastName, email, password, role} = req.body;
  const oldUser = await User.findOne({ email: email });
  if (oldUser) {
    const error = appError.create('User already exists', 400, httpServerText.FAIL);
    return next(error);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role
  });

  const token = await generateJWT({
    email: newUser.email,
    id: newUser._id,
    role: newUser.role,
  });
  newUser.token = token;
  await newUser.save();

  res.status(201).json({ status: httpServerText.SUCCESS, data: { user: newUser } });
});

const login = asyncWrapper(async(req, res, next) => {
  const {email,password}=req.body
  if(!email&&!password){
    const error=appError.create('Email And password are required', 400, httpServerText.FAIL)
    next(error)
  }
  const user= await User.findOne({email:email})
  if(!user){
    const error=appError.create('user not found', 400, httpServerText.FAIL)
    next(error)
  }
  const matchedPassword=await bcrypt.compare(password,user.password)
 
  if(user&&matchedPassword){
    const token=await generateJWT({email:user.email,id:user._id,role:user.role})
    res.status(201).json({ status: httpServerText.SUCCESS,       data: {
      token,
      role: user.role,  // Include the role in the response
    }, })
  }
  else{
    const error=appError.create('something wrong', 500, httpServerText.ERROR)
    next(error)
  }
})
module.exports = {
  getAllUsers,
  register,
  login,

}