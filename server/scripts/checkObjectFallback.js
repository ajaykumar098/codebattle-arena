require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('../src/models/Problem');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const problems = await Problem.find({ javaStarterCode: { $regex: 'Object' } });
  console.log('Problems still containing Object fallback:', problems.length);
  problems.forEach(p => console.log(p.slug, '-', p.javaStarterCode));
  process.exit();
}

check();
