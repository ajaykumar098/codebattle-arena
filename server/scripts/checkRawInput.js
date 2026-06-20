require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('../src/models/Problem');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const p = await Problem.findOne({ slug: 'two-sum' });
  console.log('Raw input bytes for TC 0:');
  const input = p.testCases[0].input;
  console.log('Length:', input.length);
  console.log('Chars:', Array.from(input).map(c => c.charCodeAt(0)).join(' '));
  console.log('Raw:', JSON.stringify(input));
  process.exit();
}

check();
