require("dotenv").config();
const mongoose = require("mongoose");
const Problem = require("./src/models/Problem");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const problem = await Problem.findOne({ slug: "add-two-numbers" });

  console.log("Problem: Add Two Numbers");
  console.log("Function name:", problem.functionName);
  console.log("\nTest cases:");

  problem.testCases.forEach((tc, i) => {
    console.log(`\nTest case ${i + 1}:`);
    console.log("  Input:", tc.input);
    console.log("  Expected:", tc.expectedOutput);
    console.log("  Is Hidden:", tc.isHidden);
  });

  await mongoose.disconnect();
})();
