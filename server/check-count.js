require("dotenv").config();
const mongoose = require("mongoose");
const Problem = require("./src/models/Problem");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const count = await Problem.countDocuments();
  console.log(`Total problems in database: ${count}`);
  
  // Show first few and last few problem titles
  const first5 = await Problem.find().limit(5).select("title");
  const last5 = await Problem.find().sort({ _id: -1 }).limit(5).select("title");
  
  console.log("\nFirst 5 problems:");
  first5.forEach(p => console.log(`  - ${p.title}`));
  
  console.log("\nLast 5 problems:");
  last5.reverse().forEach(p => console.log(`  - ${p.title}`));
  
  await mongoose.disconnect();
})();
