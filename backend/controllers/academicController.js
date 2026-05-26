const Academic = require('../models/Academic');

const normalizeText = (value) => String(value || '').trim();

const normalizeList = (items) => {
  const seen = new Set();
  return (Array.isArray(items) ? items : [])
    .map(normalizeText)
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const normalizeAcademics = (data) => ({
  universities: (Array.isArray(data?.universities) ? data.universities : [])
    .map((university) => ({
      name: normalizeText(university.name),
      sessions: normalizeList(university.sessions),
      degrees: (Array.isArray(university.degrees) ? university.degrees : [])
        .map((degree) => ({
          name: normalizeText(degree.name),
          subjects: normalizeList(degree.subjects),
        }))
        .filter((degree) => degree.name),
    }))
    .filter((university) => university.name),
});

const validateAcademics = (data) => {
  const normalized = normalizeAcademics(data);
  const universityNames = new Set();

  for (const university of normalized.universities) {
    const universityKey = university.name.toLowerCase();
    if (universityNames.has(universityKey)) {
      return { error: `Duplicate university: ${university.name}` };
    }
    universityNames.add(universityKey);

    const degreeNames = new Set();
    for (const degree of university.degrees) {
      const degreeKey = degree.name.toLowerCase();
      if (degreeNames.has(degreeKey)) {
        return { error: `Duplicate degree ${degree.name} in ${university.name}` };
      }
      degreeNames.add(degreeKey);
    }
  }

  return { data: normalized };
};

const getAcademics = async (req, res) => {
  try {
    const academics = await Academic.findOne({ key: 'default' }).lean();
    res.json({ universities: academics?.universities || [] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load academic data' });
  }
};

const updateAcademics = async (req, res) => {
  try {
    const result = validateAcademics(req.body);
    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    const academics = await Academic.findOneAndUpdate(
      { key: 'default' },
      { key: 'default', universities: result.data.universities },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    return res.json({ universities: academics.universities || [] });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to save academic data' });
  }
};

module.exports = {
  getAcademics,
  updateAcademics,
};
