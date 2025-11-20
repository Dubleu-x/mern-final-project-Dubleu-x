const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  files: [{
    filename: String,
    url: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  textSubmission: String,
  submittedAt: {
    type: Date,
    default: Date.now
  },
  grade: {
    points: Number,
    maxPoints: Number,
    feedback: String,
    gradedAt: Date,
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'late', 'missing'],
    default: 'submitted'
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Compound index to ensure one submission per student per assignment (for single submissions)
submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true, partialFilterExpression: { 'grade.points': { $exists: false } } });

module.exports = mongoose.model('Submission', submissionSchema);