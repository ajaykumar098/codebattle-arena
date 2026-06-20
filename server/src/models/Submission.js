const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  slug: { type: String, required: true },
  passed: { type: Boolean, required: true },
  passedTests: { type: Number, required: true },
  totalTests: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
