const vm = require('vm');

const TIMEOUT_MS = 3000;

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

module.exports = { runSubmission };
