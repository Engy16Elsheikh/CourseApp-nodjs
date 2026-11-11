require('dotenv').config()
const dns = require('node:dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
httpStatusText =require('./utils/httpServerText')
const path = require('path')
const cors=require('cors')
const express=require("express")
const app=express()
app.use(cors())
app.use(express.json())
app.use('/uploads',express.static(path.join(__dirname,'uploads')))
const coursesRouter=require('./routes/courses.rout')
const usersRouter=require('./routes/user.rout')
const mongoose=require('mongoose')
 

const url = process.env.MONGO_URL;

mongoose.connect(url)
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch((error) => {
        console.error('MongoDB connection failed:', error.message);
    });
app.use('/api/courses',coursesRouter)
app.use('/api/users',usersRouter)
app.all('*',(req,res,next)=>
{
    res.status(404).json({ status:httpStatusText.ERROR ,message:'this Resource is not avilable'});
})
app.use((error, req, res, next) => {
    res.status(error.statusCode||500).json({ status: error.statusText||httpStatusText.ERROR, message: error.message,data:null });
});

app.listen(process.env.PORT||5000,()=>{
    console.log("listening on port 5000")
})