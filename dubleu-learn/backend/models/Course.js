const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true,
    enum: ['math', 'science', 'english', 'history', 'art', 'music', 'pe', 'technology']
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  syllabus: String,
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'draft'],
    default: 'active'
  },
  coverImage: String,
  requirements: [String],
  learningObjectives: [String]
}, {
  timestamps: true
});

// Virtual for lesson count
courseSchema.virtual('lessonCount', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'courseId',
  count: true
});

// Virtual for assignment count
courseSchema.virtual('assignmentCount', {
  ref: 'Assignment',
  localField: '_id',
  foreignField: 'courseId',
  count: true
});

courseSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Course', courseSchema);