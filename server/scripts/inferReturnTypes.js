require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('../src/models/Problem');

function inferType(value) {
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'int' : 'double';
  }
  if (typeof value === 'string') return 'String';
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return { type: 'int[]', ambiguous: true, reason: 'empty array, defaulted to int[]' };
    }
    if (Array.isArray(value[0])) {
      const innerFlat = value.flat();
      const innerTypes = new Set(innerFlat.map(v => {
        const t = inferType(v);
        return typeof t === 'object' ? t.type : t;
      }));
      const innerType = innerTypes.size === 1 ? [...innerTypes][0] : 'Object';
      return `${innerType}[][]`;
    }
    const elementTypes = new Set(value.map(v => {
      const t = inferType(v);
      return typeof t === 'object' ? t.type : t;
    }));
    if (elementTypes.size > 1) {
      return { type: 'Object[]', ambiguous: true, reason: `mixed element types: ${[...elementTypes].join(', ')}` };
    }
    const elType = [...elementTypes][0];
    if (elType === 'int') return 'int[]';
    if (elType === 'String') return 'String[]';
    if (elType === 'boolean') return 'boolean[]';
    if (elType === 'double') return 'double[]';
    return { type: 'Object[]', ambiguous: true, reason: `unhandled element type: ${elType}` };
  }
  if (value === null) return { type: 'Object', ambiguous: true, reason: 'null value' };
  return { type: 'Object', ambiguous: true, reason: `unhandled value type: ${typeof value}` };
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const problems = await Problem.find();
  console.log(`Inspecting ${problems.length} problems...`);

  let cleanCount = 0;
  let flaggedCount = 0;
  const flaggedList = [];

  for (const problem of problems) {
    if (!problem.testCases || problem.testCases.length === 0) {
      flaggedList.push({ slug: problem.slug, reason: 'no test cases' });
      flaggedCount++;
      continue;
    }

    let parsed;
    try {
      parsed = JSON.parse(problem.testCases[0].expectedOutput);
    } catch (e) {
      flaggedList.push({ slug: problem.slug, reason: 'expectedOutput failed JSON.parse' });
      flaggedCount++;
      continue;
    }

    const result = inferType(parsed);
    const returnType = typeof result === 'object' ? result.type : result;

    await Problem.findByIdAndUpdate(problem._id, { returnType });

    if (typeof result === 'object') {
      flaggedCount++;
      flaggedList.push({ slug: problem.slug, returnType, reason: result.reason });
    } else {
      cleanCount++;
    }
  }

  console.log(`\nDone. Clean: ${cleanCount}, Flagged for review: ${flaggedCount}`);
  console.log('\n--- FLAGGED PROBLEMS ---');
  flaggedList.forEach(f => console.log(JSON.stringify(f)));

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
