const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  enrollmentNumber: { type: String, required: true, unique: true, index: true },
  university: { type: String, default: '' },
  degree: { type: String, default: '' },
  subject: { type: String, default: '' },
});

module.exports = mongoose.model('Student', studentSchema);
