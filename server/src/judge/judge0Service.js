const LANGUAGE_CONFIG = {
  python: { language: 'python', version: '3.12.0' },
};

async function runCode(code, language, stdin, testCaseIndex = 0) {
  const config = LANGUAGE_CONFIG[language];
  const pistonUrl = process.env.PISTON_URL || 'http://localhost:2000';

  const res = await fetch(`${pistonUrl}/api/v2/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language: config.language,
      version: config.version,
      files: [{ content: code }],
      stdin: stdin || '',
    }),
  });

  const result = await res.json();

  return {
    stdout: result.run?.stdout?.trim() ?? '',
    stderr: result.run?.stderr ?? '',
    compileError: result.compile?.stderr ?? '',
    status: result.run?.code === 0 ? 'Accepted' : 'Error',
  };
}

module.exports = { runCode };
