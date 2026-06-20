require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('../src/models/Problem');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const total = await Problem.countDocuments();
  const converted = await Problem.countDocuments({ starterCode: { $regex: 'import sys' } });
  console.log('Total:', total, '| Converted so far:', converted);
  process.exit();
}

check();
