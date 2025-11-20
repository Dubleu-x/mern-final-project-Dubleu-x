const express = require('express');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Get lessons for a course
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check access
    if (req.user.role === 'student' && !course.students.includes(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const lessons = await Lesson.find({ courseId: req.params.courseId })
      .sort({ order: 1 });

    res.json(lessons);
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get lesson by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('courseId');
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check access
    const course = await Course.findById(lesson.courseId);
    if (req.user.role === 'student' && !course.students.includes(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(lesson);
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create lesson
router.post('/', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.body.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the teacher
    if (req.user.role !== 'admin' && course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const lesson = new Lesson(req.body);
    await lesson.save();
    await lesson.populate('courseId');

    res.status(201).json(lesson);
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update lesson
router.put('/:id', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('courseId');
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check if user is the teacher
    if (req.user.role !== 'admin' && lesson.courseId.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedLesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('courseId');

    res.json(updatedLesson);
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete lesson
router.delete('/:id', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('courseId');
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check if user is the teacher
    if (req.user.role !== 'admin' && lesson.courseId.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Lesson.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;