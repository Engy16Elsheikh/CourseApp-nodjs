const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const asyncWrapper = require('../middleware/asyncWrapper');
const Course = require('../models/course.model');
const appError = require('../utils/appError');
const httpServerText = require('../utils/httpServerText');

// ---------- Cloudinary ----------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ---------- Multer (memory storage, Vercel's disk is read-only) ----------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 }, // Vercel rejects bodies over ~4.5MB
}).single('courseImage'); // 'courseImage' is the field name in the form

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: 'courses' }, (err, result) =>
        err ? reject(err) : resolve(result)
      )
      .end(buffer);
  });

// ---------- Controllers ----------
const getAllCourse = asyncWrapper(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  const courses = await Course.find({}, { __v: false }).limit(limit).skip(skip);
  res.json({ status: httpServerText.SUCCESS, data: { courses } });
});

const getSingleCourse = asyncWrapper(async (req, res, next) => {
  const course = await Course.findById(req.params.CourseId);
  if (!course) {
    const error = appError.create('course not found', 404, httpServerText.FAIL);
    return next(error);
  }
  return res.json({ status: httpServerText.SUCCESS, data: { course } });
});

const addCourse = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ status: 'error', message: err.message });
    }
    try {
      let courseImage = null;
      if (req.file) {
        const result = await uploadToCloudinary(req.file.buffer);
        courseImage = result.secure_url;
      }

      const newCourse = await Course.create({
        title: req.body.title,
        price: req.body.price,
        courseImage,
      });

      return res.status(201).json({
        status: httpServerText.SUCCESS,
        data: { course: newCourse },
      });
    } catch (e) {
      return res.status(500).json({ status: 'error', message: e.message });
    }
  });
};

const updateCourse = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ status: 'error', message: err.message });
    }
    try {
      const updatedData = { ...req.body };

      if (req.file) {
        const result = await uploadToCloudinary(req.file.buffer);
        updatedData.courseImage = result.secure_url;
      }

      const updatedCourse = await Course.findByIdAndUpdate(
        req.params.CourseId,
        { $set: updatedData },
        { new: true }
      );

      if (!updatedCourse) {
        return res.status(404).json({ status: 'error', message: 'Course not found' });
      }

      return res.status(200).json({
        status: httpServerText.SUCCESS,
        data: { course: updatedCourse },
      });
    } catch (e) {
      return res.status(400).json({ status: 'error', message: e.message });
    }
  });
};

const deleteCourse = asyncWrapper(async (req, res) => {
  await Course.deleteOne({ _id: req.params.CourseId });
  return res.status(200).json({ status: httpServerText.SUCCESS, data: null });
});

module.exports = {
  getAllCourse,
  getSingleCourse,
  addCourse,
  updateCourse,
  deleteCourse,
};