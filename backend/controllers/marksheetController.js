const Marksheet = require('../models/Marksheet');
const Student = require('../models/Student');

const toTitleCase = (value) =>
  (value || '')
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

// Add new marksheet
exports.addMarksheet = async (req, res) => {
  try {
    const {
      studentName, enrollmentNumber, rollNumber, marksheetNumber,
      academicYear, session, subject, degree, university,
      type, result, remarks, description,
    } = req.body;

    const remarkValue = remarks ?? description ?? '';
    const normalized = {
      studentName: toTitleCase(studentName),
      enrollmentNumber: (enrollmentNumber || '').trim(),
      rollNumber: (rollNumber || '').trim(),
      marksheetNumber: (marksheetNumber || '').trim(),
      academicYear: (academicYear || '').trim(),
      session: (session || '').trim(),
      subject: (subject || '').trim(),
      degree: (degree || '').trim(),
      university: (university || '').trim(),
    };

    const missingFields = Object.entries(normalized)
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (!result) missingFields.push('result');

    if (missingFields.length > 0) {
      return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
    }

    const existingMarksheet = await Marksheet.findOne({ marksheetNumber: normalized.marksheetNumber });
    if (existingMarksheet) {
      return res.status(400).json({ message: 'A marksheet with this marksheet number already exists' });
    }

    const marksheet = new Marksheet({
      ...normalized,
      type: type || 'regular',
      result,
      remarks: remarkValue,
      description: remarkValue,
    });

    await marksheet.save();

    await Student.findOneAndUpdate(
      { enrollmentNumber: normalized.enrollmentNumber },
      {
        name: normalized.studentName,
        enrollmentNumber: normalized.enrollmentNumber,
        university: normalized.university,
        degree: normalized.degree,
        subject: normalized.subject,
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: 'Marksheet added successfully', marksheet });
  } catch (error) {
    res.status(500).json({ message: 'Error adding marksheet', error: error.message });
  }
};

// Get all marksheets with pagination and filters
exports.getAllMarksheets = async (req, res) => {
  try {
    const {
      page = '1', limit = '10', search,
      academicYear, session, subject, degree, university, issued, addedFrom, addedTo,
    } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const filter = {};

    if (search) {
      filter.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { enrollmentNumber: { $regex: search, $options: 'i' } },
      ];
    }

    if (academicYear) filter.academicYear = academicYear;
    if (session) filter.session = session;
    if (subject) filter.subject = subject;
    if (degree) filter.degree = degree;
    if (university) filter.university = university;

    if (issued === 'true' || issued === 'false') {
      filter.issued = issued === 'true';
    }

    if (addedFrom || addedTo) {
      filter.createdAt = {};
      if (addedFrom) filter.createdAt.$gte = new Date(addedFrom);
      if (addedTo) filter.createdAt.$lte = new Date(addedTo);
    }

    const [total, marksheets] = await Promise.all([
      Marksheet.countDocuments(filter),
      Marksheet.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNumber),
    ]);

    res.json({
      message: 'Marksheets retrieved successfully',
      total,
      page: pageNumber,
      pages: Math.max(Math.ceil(total / limitNumber), 1),
      limit: limitNumber,
      marksheets,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving marksheets', error: error.message });
  }
};

// Summary for dashboard
exports.getMarksheetSummary = async (req, res) => {
  try {
    const now = Date.now();
    const unissuedMarksheets = await Marksheet.find({ issued: false })
      .select('university session academicYear subject createdAt')
      .lean();

    const [issuedCount, totalCount, recentAdded] = await Promise.all([
      Marksheet.countDocuments({ issued: true }),
      Marksheet.countDocuments({}),
      Marksheet.countDocuments({ createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } }),
    ]);

    const byUniversity = {};
    const bySession = {};
    const byAcademicYear = {};
    const bySubject = {};
    const ageBuckets = { '0-7 days': 0, '8-30 days': 0, '31-90 days': 0, '90+ days': 0 };

    unissuedMarksheets.forEach((item) => {
      const universityName = item.university || 'Unknown';
      const sessionName = item.session || 'Unknown';
      const academicYearName = item.academicYear || 'Unknown';
      const subjectName = item.subject || 'Unknown';

      byUniversity[universityName] = (byUniversity[universityName] || 0) + 1;
      bySession[sessionName] = (bySession[sessionName] || 0) + 1;
      byAcademicYear[academicYearName] = (byAcademicYear[academicYearName] || 0) + 1;
      bySubject[subjectName] = (bySubject[subjectName] || 0) + 1;

      const ageDays = Math.floor((now - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      if (ageDays <= 7) ageBuckets['0-7 days'] += 1;
      else if (ageDays <= 30) ageBuckets['8-30 days'] += 1;
      else if (ageDays <= 90) ageBuckets['31-90 days'] += 1;
      else ageBuckets['90+ days'] += 1;
    });

    const toSortedArray = (source) =>
      Object.entries(source).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    const summary = {
      unissuedTotal: unissuedMarksheets.length,
      issuedTotal: issuedCount,
      totalMarksheets: totalCount,
      recentAdded,
      byUniversity: toSortedArray(byUniversity),
      bySession: toSortedArray(bySession),
      byAcademicYear: Object.entries(byAcademicYear).map(([name, value]) => ({ name, value })).sort((a, b) => a.name.localeCompare(b.name)),
      bySubject: toSortedArray(bySubject).slice(0, 5),
      ageBuckets: Object.entries(ageBuckets).map(([name, value]) => ({ name, value })),
    };

    res.json({ message: 'Summary retrieved successfully', summary });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving summary', error: error.message });
  }
};

// Search marksheets by name or enrollment number
exports.searchMarksheets = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: 'Search query is required' });

    const marksheets = await Marksheet.find({
      $or: [
        { studentName: { $regex: query, $options: 'i' } },
        { enrollmentNumber: { $regex: query, $options: 'i' } },
      ],
    }).sort({ createdAt: -1 });

    res.json({ message: 'Search completed', count: marksheets.length, marksheets });
  } catch (error) {
    res.status(500).json({ message: 'Error searching marksheets', error: error.message });
  }
};

// Get marksheet by ID
exports.getMarksheetById = async (req, res) => {
  try {
    const { id } = req.params;
    const marksheet = await Marksheet.findById(id);
    if (!marksheet) return res.status(404).json({ message: 'Marksheet not found' });
    res.json({ message: 'Marksheet retrieved successfully', marksheet });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving marksheet', error: error.message });
  }
};

// Update marksheet
exports.updateMarksheet = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      studentName, enrollmentNumber, rollNumber, marksheetNumber,
      academicYear, session, subject, degree, university,
      type, result, remarks, description, issued,
    } = req.body;
    const remarkValue = remarks ?? description;

    const marksheet = await Marksheet.findById(id);
    if (!marksheet) return res.status(404).json({ message: 'Marksheet not found' });

    if (studentName) marksheet.studentName = toTitleCase(studentName);
    if (enrollmentNumber) marksheet.enrollmentNumber = enrollmentNumber.trim();
    if (rollNumber) marksheet.rollNumber = rollNumber.trim();
    if (marksheetNumber) marksheet.marksheetNumber = marksheetNumber.trim();
    if (academicYear) marksheet.academicYear = academicYear;
    if (session) marksheet.session = session;
    if (subject) marksheet.subject = subject;
    if (degree) marksheet.degree = degree;
    if (university) marksheet.university = university;
    if (type) marksheet.type = type;
    if (result) marksheet.result = result;
    if (remarkValue !== undefined) {
      marksheet.remarks = remarkValue;
      marksheet.description = remarkValue;
    }
    if (issued !== undefined) marksheet.issued = issued;
    marksheet.updatedAt = Date.now();

    await marksheet.save();
    res.json({ message: 'Marksheet updated successfully', marksheet });
  } catch (error) {
    res.status(500).json({ message: 'Error updating marksheet', error: error.message });
  }
};

// Delete marksheet
exports.deleteMarksheet = async (req, res) => {
  try {
    const { id } = req.params;
    const marksheet = await Marksheet.findByIdAndDelete(id);
    if (!marksheet) return res.status(404).json({ message: 'Marksheet not found' });
    res.json({ message: 'Marksheet deleted successfully', marksheet });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting marksheet', error: error.message });
  }
};

// Toggle issued status
exports.toggleIssuedStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const marksheet = await Marksheet.findById(id);
    if (!marksheet) return res.status(404).json({ message: 'Marksheet not found' });

    const nextIssued = !marksheet.issued;
    marksheet.issued = nextIssued;
    if (nextIssued) {
      marksheet.issuedAt = Date.now();
      marksheet.issuedBy = req.admin?.username || 'Unknown';
    }
    marksheet.updatedAt = Date.now();
    await marksheet.save();

    res.json({ message: 'Marksheet status updated successfully', marksheet });
  } catch (error) {
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
};
