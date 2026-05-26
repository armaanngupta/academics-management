const Student = require('../models/Student');

exports.getAllStudents = async (req, res) => {
  try {
    const { page = '1', limit = '10', q } = req.query;
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const filter = q
      ? { $or: [{ name: { $regex: q, $options: 'i' } }, { enrollmentNumber: { $regex: q, $options: 'i' } }] }
      : {};

    const [total, students] = await Promise.all([
      Student.countDocuments(filter),
      Student.find(filter).sort({ name: 1 }).skip(skip).limit(limitNumber).lean(),
    ]);

    res.json({
      students,
      total,
      page: pageNumber,
      pages: Math.max(Math.ceil(total / limitNumber), 1),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving students', error: error.message });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const { name, enrollmentNumber, university, degree, subject } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Student name is required' });
    }
    if (!enrollmentNumber || !enrollmentNumber.trim()) {
      return res.status(400).json({ message: 'Enrollment number is required' });
    }

    const existing = await Student.findOne({ enrollmentNumber: enrollmentNumber.trim() });
    if (existing) {
      return res.status(409).json({ message: 'A student with this enrollment number already exists' });
    }

    const student = new Student({
      name: name.trim(),
      enrollmentNumber: enrollmentNumber.trim(),
      university: (university || '').trim(),
      degree: (degree || '').trim(),
      subject: (subject || '').trim(),
    });

    await student.save();
    res.status(201).json({ message: 'Student created successfully', student });
  } catch (error) {
    res.status(500).json({ message: 'Error creating student', error: error.message });
  }
};

exports.checkEnrollment = async (req, res) => {
  try {
    const { enrollment } = req.query;
    if (!enrollment) return res.json({ exists: false });
    const student = await Student.findOne({ enrollmentNumber: enrollment.trim() }).lean();
    res.json({ exists: !!student });
  } catch (error) {
    res.status(500).json({ message: 'Error checking enrollment', error: error.message });
  }
};

exports.searchStudents = async (req, res) => {
  try {
    const { q, field } = req.query;
    if (!q || q.trim().length < 1) {
      return res.json({ students: [] });
    }

    const filter =
      field === 'enrollmentNumber'
        ? { enrollmentNumber: { $regex: q.trim(), $options: 'i' } }
        : { name: { $regex: q.trim(), $options: 'i' } };

    const students = await Student.find(filter).limit(8).lean();
    res.json({ students });
  } catch (error) {
    res.status(500).json({ message: 'Error searching students', error: error.message });
  }
};
