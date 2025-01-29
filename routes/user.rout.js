const express=require('express')
const router=express.Router()
const multer  = require('multer')
const diskStorage=multer.diskStorage({
  destination:function(req,file,cb)
    { 
      console.log("FILE",file)
      cb(null,'uploads')
    },
    
})
const upload=multer({storage:diskStorage})
const usersController=require('../controllers/users.controller')
const verifyToken = require('../middleware/verifyToken')
router.route('/')
  .get(verifyToken,usersController.getAllUsers)
router.route('/register')
  .post(upload.single('avatar'),usersController.register)
router.route('/login')
  .post(usersController.login)
 
module.exports=router