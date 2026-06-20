require("dotenv").config();
const mongoose = require("mongoose");
const Problem = require("./src/models/Problem");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.\n");

  // Find all problems with "Definition for" in their starterCode
  const problemsToDelete = await Problem.find({
    starterCode: { $regex: "Definition for" }
  });

  console.log(`Found ${problemsToDelete.length} problems with custom structures:\n`);

  problemsToDelete.forEach((p) => {
    console.log(`  - ${p.title} (${p.slug})`);
  });

  if (problemsToDelete.length > 0) {
    console.log(`\nDeleting these ${problemsToDelete.length} problems...`);

    const result = await Problem.deleteMany({
      starterCode: { $regex: "Definition for" }
    });

    console.log(`✓ Deleted ${result.deletedCount} problems.\n`);
  }

  // Show remaining count
  const remaining = await Problem.countDocuments();
  console.log(`Remaining problems in database: ${remaining}`);

  await mongoose.disconnect();
})();
