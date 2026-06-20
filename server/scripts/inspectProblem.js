require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('../src/models/Problem');

async function inspectProblem() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const p = await Problem.findOne({ slug: 'two-sum' });
    if (!p) {
      console.log('Problem not found');
      return;
    }

    console.log(JSON.stringify(p, null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

inspectProblem();
