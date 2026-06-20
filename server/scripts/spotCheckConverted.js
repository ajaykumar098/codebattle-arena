require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('../src/models/Problem');

async function spotCheck() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Get random problems from different ranges to spot-check
  const checks = [
    { skip: 0, limit: 1, label: 'First converted' },
    { skip: 100, limit: 1, label: 'Middle range' },
    { skip: 200, limit: 1, label: 'Late range' },
    { skip: 300, limit: 1, label: 'End range' },
  ];

  for (const check of checks) {
    const p = await Problem.find({ starterCode: { $regex: 'import sys' } }).skip(check.skip).limit(check.limit);
    if (p.length > 0) {
      const problem = p[0];
      console.log(`--- ${check.label}: ${problem.slug} ---`);
      console.log('Function:', problem.functionName);
      console.log('Test cases:', JSON.stringify(problem.testCases.slice(0, 2), null, 2));
      console.log('Starter code (first 200 chars):', problem.starterCode.substring(0, 200));
      console.log('');
    }
  }

  process.exit();
}

spotCheck();
