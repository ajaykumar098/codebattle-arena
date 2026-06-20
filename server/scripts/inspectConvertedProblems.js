require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('../src/models/Problem');

async function inspect() {
  await mongoose.connect(process.env.MONGO_URI);
  const ps = await Problem.find({ starterCode: { $regex: 'import sys' } }).skip(5).limit(3);
  ps.forEach(p => {
    console.log('---', p.slug, '---');
    console.log(p.starterCode);
    console.log('testCases:', JSON.stringify(p.testCases));
  });
  process.exit();
}

inspect();
