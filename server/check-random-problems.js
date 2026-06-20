require("dotenv").config();
const mongoose = require("mongoose");
const Problem = require("./src/models/Problem");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Get 5 random problems
  const problems = await Problem.aggregate([
    { $sample: { size: 5 } },
    { $project: { slug: 1, title: 1, difficulty: 1, description: 1 } }
  ]);
  
  console.log("=== 5 Random Problems ===\n");
  
  problems.forEach((p, i) => {
    console.log(`${i + 1}. ${p.title} (${p.difficulty})`);
    console.log(`   Slug: ${p.slug}`);
    console.log(`   Description:\n${p.description.substring(0, 500)}${p.description.length > 500 ? '...' : ''}`);
    
    // Check for "any order" patterns
    const hasAnyOrder = /any\s+order|in\s+any\s+order|any\s+valid|in\s+any\s+valid/i.test(p.description);
    const hasTolerance = /10\^-\d|tolerance|within\s+\d|epsilon|approximately/i.test(p.description);
    
    if (hasAnyOrder) console.log("   ⚠️  ISSUE: Multiple valid answer types (any order/any valid)");
    if (hasTolerance) console.log("   ⚠️  ISSUE: Floating-point tolerance required");
    
    console.log();
  });
  
  await mongoose.disconnect();
})();
