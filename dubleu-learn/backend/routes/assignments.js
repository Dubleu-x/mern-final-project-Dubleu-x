const express = require('express');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Course = require('../models/Course');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Get assignments for a course
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

    const assignments = await Assignment.find({ courseId: req.params.courseId })
      .sort({ dueDate: 1 });

    res.json(assignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get upcoming assignments
router.get('/upcoming', auth, async (req, res) => {
  try {
    let assignments;
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    if (req.user.role === 'student') {
      const userCourses = await Course.find({ students: req.user._id });
      const courseIds = userCourses.map(course => course._id);

      assignments = await Assignment.find({
        courseId: { $in: courseIds },
        dueDate: { $gte: now, $lte: oneWeekFromNow }
      })
      .populate('courseId', 'title')
      .sort({ dueDate: 1 })
      .limit(10);
    } else {
      assignments = await Assignment.find({
        dueDate: { $gte: now, $lte: oneWeekFromNow }
      })
      .populate('courseId', 'title')
      .sort({ dueDate: 1 })
      .limit(10);
    }

    res.json(assignments);
  } catch (error) {
    console.error('Get upcoming assignments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get assignment by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('courseId');
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check access
    const course = await Course.findById(assignment.courseId);
    if (req.user.role === 'student' && !course.students.includes(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(assignment);
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create assignment
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

    const assignment = new Assignment(req.body);
    await assignment.save();
    await assignment.populate('courseId');

    res.status(201).json(assignment);
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit assignment
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if student is enrolled in the course
    const course = await Course.findById(assignment.courseId);
    if (!course.students.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    const submissionData = {
      assignmentId: req.params.id,
      studentId: req.user._id,
      ...req.body
    };

    // Check for existing submission if single submission is required
    if (assignment.allowedSubmissions === 'single') {
      const existingSubmission = await Submission.findOne({
        assignmentId: req.params.id,
        studentId: req.user._id
      });

      if (existingSubmission) {
        return res.status(400).json({ message: 'Only one submission allowed for this assignment' });
      }
    }

    const submission = new Submission(submissionData);
    await submission.save();

    // Add submission to assignment
    await Assignment.findByIdAndUpdate(req.params.id, {
      $push: { submissions: submission._id }
    });

    await submission.populate('studentId', 'profile firstName lastName');

    res.status(201).json(submission);
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get submissions for an assignment
router.get('/:id/submissions', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('courseId');
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if user is the teacher
    if (req.user.role !== 'admin' && assignment.courseId.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const submissions = await Submission.find({ assignmentId: req.params.id })
      .populate('studentId', 'profile firstName lastName email');

    res.json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Grade submission
router.put('/submissions/:id/grade', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('assignmentId')
      .populate('studentId', 'profile firstName lastName');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if user is the teacher
    const assignment = await Assignment.findById(submission.assignmentId).populate('courseId');
    if (req.user.role !== 'admin' && assignment.courseId.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    submission.grade = {
      points: req.body.points,
      maxPoints: assignment.maxPoints,
      feedback: req.body.feedback,
      gradedAt: new Date(),
      gradedBy: req.user._id
    };
    submission.status = 'graded';

    await submission.save();
    res.json(submission);
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;