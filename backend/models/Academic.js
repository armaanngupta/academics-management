const mongoose = require('mongoose');

const degreeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    subjects: [{ type: String, trim: true }],
  },
  { _id: false }
);

const universitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sessions: [{ type: String, trim: true }],
    degrees: [degreeSchema],
  },
  { _id: false }
);

const academicSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'default', unique: true },
    universities: [universitySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Academic', academicSchema);
