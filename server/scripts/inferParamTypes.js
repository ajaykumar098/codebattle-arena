require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('../src/models/Problem');

// Infer a Java type from a single JSON value
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
  return { type: 'Object', ambiguous: true, reason: `unhandled value type: ${typeof value}` };
}

function inferParamTypesForProblem(problem) {
  const lines = problem.testCases[0].input.split('\n');
  const types = [];
  const flags = [];

  lines.forEach((line, i) => {
    let parsed;
    try {
      parsed = JSON.parse(line);
    } catch (e) {
      types.push('String');
      flags.push(`arg${i}: failed to JSON.parse, defaulted to String`);
      return;
    }
    const result = inferType(parsed);
    if (typeof result === 'object') {
      types.push(result.type);
      flags.push(`arg${i}: ${result.reason}`);
    } else {
      types.push(result);
    }
  });

  return { types, flags };
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

    const { types, flags } = inferParamTypesForProblem(problem);

    await Problem.findByIdAndUpdate(problem._id, { paramTypes: types });

    if (flags.length > 0) {
      flaggedCount++;
      flaggedList.push({ slug: problem.slug, types, flags });
    } else {
      cleanCount++;
    }
  }

  console.log(`\nDone. Clean: ${cleanCount}, Flagged for review: ${flaggedCount}`);
  console.log('\n--- FLAGGED PROBLEMS ---');
  flaggedList.forEach(f => {
    console.log(JSON.stringify(f));
  });

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
