const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Academic = require('../models/Academic');
const academicsData = require('../../frontend/src/data/academics.json');

dotenv.config();

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

const run = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured');
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const normalized = normalizeAcademics(academicsData);
  await Academic.findOneAndUpdate(
    { key: 'default' },
    { key: 'default', universities: normalized.universities },
    { upsert: true, new: true, runValidators: true }
  );

  console.log(`Imported ${normalized.universities.length} universities into MongoDB.`);
};

run()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
