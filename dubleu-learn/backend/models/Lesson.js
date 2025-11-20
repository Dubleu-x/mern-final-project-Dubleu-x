const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
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
  content: {
    type: String,
    required: true
  },
  videoUrl: String,
  attachments: [{
    filename: String,
    url: String,
    fileType: String
  }],
  order: {
    type: Number,
    required: true
  },
  duration: Number, // in minutes
  isPublished: {
    type: Boolean,
    default: false
  },
  learningObjectives: [String]
}, {
  timestamps: true
});

// Compound index to ensure unique order per course
lessonSchema.index({ courseId: 1, order: 1 }, { unique: true });

module.exports = mongoose.model('Lesson', lessonSchema);