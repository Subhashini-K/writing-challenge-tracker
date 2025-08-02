import mongoose from 'mongoose';

const writingLogSchema = new mongoose.Schema({
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  wordCount: {
    type: Number,
    required: true,
    min: 0,
  },
  notes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Ensure one log per user per challenge per day
writingLogSchema.index({ challengeId: 1, userId: 1, date: 1 }, { unique: true });

export default mongoose.models.WritingLog || mongoose.model('WritingLog', writingLogSchema);
