const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  instructions: String,
  dueDate: {
    type: Date,
    required: true
  },
  maxPoints: {
    type: Number,
    required: true,
    min: 0
  },
  assignmentType: {
    type: String,
    enum: ['homework', 'quiz', 'project', 'exam', 'discussion'],
    default: 'homework'
  },
  attachments: [{
    filename: String,
    url: String,
    fileType: String
  }],
  allowedSubmissions: {
    type: String,
    enum: ['single', 'multiple'],
    default: 'single'
  },
  gradingRubric: Object
}, {
  timestamps: true
});

module.exports = mongoose.model('Assignment', assignmentSchema);