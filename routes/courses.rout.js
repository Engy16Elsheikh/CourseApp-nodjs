const express = require('express');
const courseController = require('../controllers/courses.controller');
const allowedTo = require('../middleware/allowedTo');
const verifyToken = require('../middleware/verifyToken');
const userRoles = require('../utils/userRoles');

const router = express.Router();

router.route('/')
  .get(courseController.getAllCourse)
  .post(verifyToken, courseController.addCourse);

router.route('/:CourseId')
  .get(courseController.getSingleCourse)
  .patch(verifyToken, courseController.updateCourse)
  .delete(
    verifyToken,
    allowedTo(userRoles.ADMIN, userRoles.MANAGER),
    courseController.deleteCourse
  );

module.exports = router;