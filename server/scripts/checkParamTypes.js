require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('../src/models/Problem');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const total = await Problem.countDocuments();
  const withTypes = await Problem.countDocuments({ paramTypes: { $exists: true, $ne: [] } });
  console.log('Total:', total, '| With paramTypes:', withTypes);
  process.exit();
}

check();
