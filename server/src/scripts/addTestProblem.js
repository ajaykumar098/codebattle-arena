require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('../models/Problem');

const testProblem = {
  title: 'Two Sum',
  slug: 'two-sum',
  description: 'Given an array of integers and a target value, return the indices of the two numbers that add up to the target.',
  difficulty: 'Easy',
  tags: ['Array', 'Hash Table'],
  examples: [
    {
      input: 'nums = [2,7,11,15], target = 9',
      output: '[0,1]',
      explanation: 'nums[0] + nums[1] = 2 + 7 = 9'
    }
  ],
  testCases: [
    { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isHidden: false },
    { input: '[3,2,4]\n6', expectedOutput: '[1,2]', isHidden: true }
  ],
  starterCode: 'function twoSum(nums, target) {\n  // your code here\n}'
};

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const existing = await Problem.findOne({ slug: testProblem.slug });
    if (existing) {
      console.log('Test problem already exists — skipping insert.');
    } else {
      const created = await Problem.create(testProblem);
      console.log('Test problem created with ID:', created._id);
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
