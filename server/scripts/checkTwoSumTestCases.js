require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('../src/models/Problem');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const p = await Problem.findOne({ slug: 'two-sum' });
  console.log('Test cases:');
  p.testCases.forEach((tc, i) => {
    console.log(`TC ${i}: input="${tc.input}", expected="${tc.expectedOutput}"`);
  });
  process.exit();
}

check();
