const express = require('express');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Assignment = require('../models/Assignment');
const { auth, authorize } = require('../middleware/auth');
const { courseValidation } = require('../middleware/validation');
const router = express.Router();

// Get all courses
router.get('/', auth, async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('teacher', 'profile firstName lastName')
      .populate('students', 'profile firstName lastName');

    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my courses
router.get('/my-courses', auth, async (req, res) => {
  try {
    let courses;
    if (req.user.role === 'teacher') {
      courses = await Course.find({ teacher: req.user._id })
        .populate('teacher', 'profile firstName lastName')
        .populate('students', 'profile firstName lastName');
    } else if (req.user.role === 'student') {
      courses = await Course.find({ students: req.user._id })
        .populate('teacher', 'profile firstName lastName')
        .populate('students', 'profile firstName lastName');
    } else {
      courses = await Course.find()
        .populate('teacher', 'profile firstName lastName')
        .populate('students', 'profile firstName lastName');
    }

    res.json(courses);
  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get course by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teacher', 'profile firstName lastName email')
      .populate('students', 'profile firstName lastName email');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user has access to this course
    if (req.user.role === 'student' && !course.students.some(s => s._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied to this course' });
    }

    res.json(course);
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create course (teachers and admin only)
router.post('/', auth, authorize('teacher', 'admin'), courseValidation.create, async (req, res) => {
  try {
    const courseData = {
      ...req.body,
      teacher: req.user._id
    };

    const course = new Course(courseData);
    await course.save();

    await course.populate('teacher', 'profile firstName lastName');

    res.status(201).json(course);
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update course
router.put('/:id', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the teacher of this course or admin
    if (req.user.role !== 'admin' && course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('teacher', 'profile firstName lastName')
     .populate('students', 'profile firstName lastName');

    res.json(updatedCourse);
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Enroll in course
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    if (course.students.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    course.students.push(req.user._id);
    await course.save();

    // Add course to user's enrolled courses
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { enrolledCourses: course._id }
    });

    await course.populate('teacher', 'profile firstName lastName')
                .populate('students', 'profile firstName lastName');

    res.json({ message: 'Enrolled successfully', course });
  } catch (error) {
    console.error('Enroll error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get course statistics
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const courseId = req.params.id;
    
    const [lessonCount, assignmentCount, studentCount] = await Promise.all([
      Lesson.countDocuments({ courseId }),
      Assignment.countDocuments({ courseId }),
      Course.findById(courseId).select('students').then(course => course.students.length)
    ]);

    res.json({
      lessonCount,
      assignmentCount,
      studentCount
    });
  } catch (error) {
    console.error('Get course stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;