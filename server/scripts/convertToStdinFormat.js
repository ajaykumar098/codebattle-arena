require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('../src/models/Problem');

function convertTestCase(input, expectedOutput) {
  // Parse input JSON array (e.g., "[[2,7,11,15],9]")
  const args = JSON.parse(input);
  
  // Convert each argument to stdin line (JSON stringified)
  const stdin = args.map(arg => JSON.stringify(arg)).join('\n');
  
  // Keep expectedOutput as-is (already JSON string)
  return { stdin, expectedOutput };
}

function generatePythonStarterCode(functionName, testCases) {
  // Get first test case to determine parameter count
  const firstInput = JSON.parse(testCases[0].input);
  const paramCount = firstInput.length;
  
  // Generate parameter names
  const params = Array.from({ length: paramCount }, (_, i) => `arg${i}`).join(', ');
  
  // Generate stdin parsing code
  const parseLines = Array.from({ length: paramCount }, (_, i) => 
    `  arg${i} = json.loads(lines[${i}].strip())`
  ).join('\n');
  
  return `def ${functionName}(${params}):
    # your code here
    pass

import sys
import json

lines = sys.stdin.read().splitlines()
${parseLines}

result = ${functionName}(${Array.from({ length: paramCount }, (_, i) => `arg${i}`).join(', ')})
print(json.dumps(result))`;
}

async function convertProblems(limit = 10) {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const problems = await Problem.find({ starterCode: { $not: { $regex: 'import sys' } } }).limit(limit);
    console.log(`Found ${problems.length} problems to convert`);

    for (const problem of problems) {
      console.log(`Converting: ${problem.slug}`);
      
      // Convert test cases
      const convertedTestCases = problem.testCases.map(tc => {
        const { stdin, expectedOutput } = convertTestCase(tc.input, tc.expectedOutput);
        return {
          input: stdin,
          expectedOutput,
          isHidden: tc.isHidden
        };
      });
      
      // Generate Python starter code
      const pythonStarterCode = generatePythonStarterCode(problem.functionName, problem.testCases);
      
      // Update problem
      await Problem.findByIdAndUpdate(problem._id, {
        testCases: convertedTestCases,
        starterCode: pythonStarterCode
      });
      
      console.log(`  ✓ Converted ${problem.slug}`);
    }

    console.log('Conversion complete!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

// Get limit from command line or default to 10
const limit = process.argv[2] ? parseInt(process.argv[2]) : 10;
convertProblems(limit);
