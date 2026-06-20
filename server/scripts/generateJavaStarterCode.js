require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('../src/models/Problem');

function javaType(type) {
  switch (type) {
    case 'int': return 'int';
    case 'double': return 'double';
    case 'boolean': return 'boolean';
    case 'String': return 'String';
    case 'int[]': return 'int[]';
    case 'double[]': return 'double[]';
    case 'boolean[]': return 'boolean[]';
    case 'String[]': return 'String[]';
    case 'int[][]': return 'int[][]';
    case 'double[][]': return 'double[][]';
    case 'boolean[][]': return 'boolean[][]';
    case 'String[][]': return 'String[][]';
    default: return 'Object';
  }
}

function generateJavaStarter(functionName, paramTypes, returnType) {
  const params = paramTypes.map((type, i) => `${javaType(type)} arg${i}`).join(', ');
  return `public static ${javaType(returnType)} ${functionName}(${params}) {
    // your code here
    
}`;
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const problems = await Problem.find();
  console.log(`Generating Java starter code for ${problems.length} problems...`);

  let generatedCount = 0;
  let skippedCount = 0;

  for (const problem of problems) {
    if (!problem.functionName || !problem.paramTypes || !problem.returnType) {
      console.log(`Skipping ${problem.slug}: missing required fields`);
      skippedCount++;
      continue;
    }

    const javaCode = generateJavaStarter(problem.functionName, problem.paramTypes, problem.returnType);
    await Problem.findByIdAndUpdate(problem._id, { javaStarterCode: javaCode });
    generatedCount++;
  }

  console.log(`\nDone. Generated: ${generatedCount}, Skipped: ${skippedCount}`);

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
