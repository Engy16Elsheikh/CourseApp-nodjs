const asyncWrapper = require('../middleware/asyncWrapper');
const courseModel = require('../models/course.model');
const multer = require('multer');
const path = require('path');
const Course=require('../models/course.model');
const appError = require('../utils/appError');
const httpServerText=require('../utils/httpServerText')
const getAllCourse=async(req,res)=>{
  const query=req.query
  const limit=query.limit||10;
  const page =query.page||1;
  const skip=(page-1)*limit
  const courses=await Course.find({},{"__v":false}).limit(limit).skip(skip)
  res.json({status:httpServerText.SUCCESS,data:{courses}})
}
const getSingleCourse = asyncWrapper(
  async (req, res,next) => {
    const course = await Course.findById(req.params.CourseId);
    if (!course) {
       const error=appError.create('course not found',404,httpServerText.FAIL)
        return next(error)
      //return res
        //.status(404)
        //.json({ status: httpServerText.FAIL, data: { course: "course not found" } });
    }
    return res.json({ status: httpServerText.SUCCESS, data: { course } });
  }
);

  
 // Set up multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/courses/');  // Save images in the "uploads/courses" folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Use a timestamp to avoid name conflicts
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },  // Limit file size to 5MB (optional)
}).single('courseImage');  // 'courseImage' is the field name in your form

// addCourse: handle course creation with an image upload
const addCourse = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ status: 'error', message: 'File upload failed' });
    }

    const newCourseData = {
      title: req.body.title,
      price: req.body.price,
      courseImage: req.file ? '/uploads/courses/' + req.file.filename : null,  // Store the file path or null
    };

    const newCourse = new Course(newCourseData);
    await newCourse.save();

    res.status(201).json({
      status: httpServerText.SUCCESS,
      data: { course: newCourse }
    });
  });
};
const updateCourse = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ status: 'error', message: 'File upload failed' });
    }

    try {
      const CourseId = req.params.CourseId;

      // Create an object for the fields to update
      const updatedData = {
        ...req.body,  // Spread the body fields
      };

      // If an image is uploaded, add it to the update data
      if (req.file) {
        updatedData.courseImage = '/uploads/courses/' + req.file.filename;
      }

      // Perform the update
      const UpdatedCourse = await Course.findByIdAndUpdate(CourseId, { $set: updatedData }, { new: true });

      if (!UpdatedCourse) {
        return res.status(404).json({ status: 'error', message: 'Course not found' });
      }

      return res.status(200).json({
        status: httpServerText.SUCCESS,
        data: { course: UpdatedCourse },
      });
    } catch (e) {
      return res.status(400).json({ status: 'error', message: e.message });
    }
  });
};


const deleteCourse=async(req, res) => {
  try{
    const data=await Course.deleteOne({_id:req.params.CourseId})
    return res.status(200).json({ status:httpServerText.SUCCESS ,data:null});
  }
  catch(e){
    return res.status(400).json({error:e});
   }
  }

module.exports={
    getAllCourse,
    getSingleCourse,
    addCourse,
    updateCourse,
    deleteCourse,

}