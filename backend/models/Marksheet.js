const mongoose = require('mongoose');

const marksheetSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  enrollmentNumber: { type: String, required: true },
  rollNumber: { type: String, required: true },
  marksheetNumber: { type: String, required: true, unique: true },
  academicYear: { type: String, required: true },
  session: { type: String, required: true },
  subject: { type: String, required: true },
  degree: { type: String, required: true },
  university: { type: String, required: true },
  type: { type: String, enum: ['regular', 'backlog'], default: 'regular' },
  result: { type: String, enum: ['pass', 'fail'], required: true },
  remarks: { type: String, default: '' },
  description: { type: String, default: '' },
  issued: { type: Boolean, default: false },
  issuedAt: { type: Date, default: null },
  issuedBy: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Marksheet', marksheetSchema);
