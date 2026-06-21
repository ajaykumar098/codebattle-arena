const { runCode } = require('../judge/judge0Service');
const { buildJavaWrapper } = require('../judge/javaWrapper');

const vm = require('vm');

const TIMEOUT_MS = 3000;

function buildPythonWrapper(code, functionName) {
  return `
import json, sys

${code}

_lines = sys.stdin.read().splitlines()
_args = [json.loads(line) for line in _lines if line.strip() != '']
_result = ${functionName}(*_args)
print(json.dumps(_result))
`;
}

async function gradeSubmission(problem, code, language = 'python') {
  const results = [];

  let wrappedCode;
  if (language === 'java') {
    wrappedCode = buildJavaWrapper(code, problem.functionName, problem.paramTypes);
  } else {
    wrappedCode = buildPythonWrapper(code, problem.functionName);
  }

  for (let i = 0; i < problem.testCases.length; i++) {
    const tc = problem.testCases[i];
    console.log(`--- TEST CASE ${i} ---`);
    console.log(`Raw length: ${tc.input.length}`);
    console.log(`Raw bytes: ${Array.from(tc.input).map(c => c.charCodeAt(0)).join(' ')}`);
    console.log(`Raw string: ${JSON.stringify(tc.input)}`);
    console.log(`=== USER CODE SUBMITTED ===`);
    console.log(code);
    console.log(`=== WRAPPED CODE SENT TO PISTON ===`);
    console.log(wrappedCode);
    console.log(`=== PISTON URL ===`);
    console.log(process.env.PISTON_URL || 'http://localhost:2000');
    const { stdout, stderr, compileError, status } = await runCode(wrappedCode, language, tc.input, i);
    console.log('=== STDERR ===', stderr);
    console.log('=== COMPILE ERROR ===', compileError);

    let passed = false;
    try {
      const parsedStdout = JSON.parse(stdout);
      const parsedExpected = JSON.parse(tc.expectedOutput);
      passed = !compileError && !stderr && JSON.stringify(parsedStdout) === JSON.stringify(parsedExpected);
    } catch (e) {
      passed = false;
    }

    console.log(`[JUDGE] problem=${problem.slug} lang=${language} testCase=${i} expected=${JSON.stringify(tc.expectedOutput)} actual_stdout=${JSON.stringify(stdout)} stderr=${JSON.stringify(stderr)} compileError=${JSON.stringify(compileError)} passed=${passed}`);

    console.log(`--- TEST CASE RESULT --- passed: ${passed}, stdout: "${stdout}", expected: "${tc.expectedOutput.trim()}"`);
    results.push({ passed, status, stdout, expected: tc.expectedOutput });
  }

  return {
    passed: results.every(r => r.passed),
    passedTests: results.filter(r => r.passed).length,
    totalTests: results.length,
    results,
  };
}

function runTestCase(code, functionName, testCase) {
  const { input, expectedOutput, isHidden } = testCase;

  try {
    const args = JSON.parse(input);
    const argsList = args.map((a) => JSON.stringify(a)).join(',');

    const sandbox = {};
    const context = vm.createContext(sandbox);

    // Define the user's function, then call it and store the result —
    // all inside one timed script so infinite loops get killed too.
    const script = `
      ${code}
      __result = JSON.stringify(${functionName}(${argsList}));
    `;

    vm.runInContext(script, context, { timeout: TIMEOUT_MS });

    const actualOutput = sandbox.__result;
    const expected = JSON.stringify(JSON.parse(expectedOutput));
    const passed = actualOutput === expected;

    return {
      passed,
      isHidden,
      ...(isHidden ? {} : { input, expectedOutput, actualOutput })
    };
  } catch (err) {
    return {
      passed: false,
      isHidden,
      error: err.message
    };
  }
}

function runSubmission(code, functionName, testCases) {
  return testCases.map((tc) => runTestCase(code, functionName, tc));
}

module.exports = { runSubmission, runCode, gradeSubmission };
