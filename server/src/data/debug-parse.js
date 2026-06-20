require("dotenv").config();
const fs = require("fs");
const path = require("path");

const RAW_PATH = path.join(__dirname, "..", "data", "leetcode-raw.json");
const JS_FUNCTION_PATTERN = /var\s+([a-zA-Z0-9_]+)\s*=\s*function\s*(([^)]*))/;

const raw = JSON.parse(fs.readFileSync(RAW_PATH, "utf8"));
const questions = Array.isArray(raw) ? raw : raw.questions;

console.log("Testing first 3 problems for parsing:\n");

for (let i = 0; i < 3; i++) {
  const q = questions[i];
  console.log(`[${i}] ${q.title}`);
  
  const jsSnippet = q.code_snippets && q.code_snippets.javascript;
  if (!jsSnippet) {
    console.log("  ✗ No JS snippet\n");
    continue;
  }
  
  const fnMatch = jsSnippet.match(JS_FUNCTION_PATTERN);
  if (!fnMatch) {
    console.log("  ✗ Function pattern didn't match\n");
    console.log(`  JS snippet start: ${jsSnippet.substring(0, 150)}\n`);
    continue;
  }
  
  const functionName = fnMatch[1];
  const paramNames = fnMatch[2]
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  
  console.log(`  ✓ Function: ${functionName}`);
  console.log(`  ✓ Params: ${paramNames.join(", ")}`);
  
  if (!Array.isArray(q.examples) || q.examples.length === 0) {
    console.log("  ✗ No examples\n");
    continue;
  }
  
  console.log(`  ✓ Examples: ${q.examples.length}`);
  
  // Test parsing first example
  const firstExample = q.examples[0].example_text;
  console.log(`  Example text: ${firstExample.substring(0, 80)}...`);
  
  const inputMatch = firstExample.match(/Input:\s*(.+?)(?:\nOutput:|\r?\nOutput:)/s);
  const outputMatch = firstExample.match(/Output:\s*(.+?)(?:\nExplanation:|$)/s);
  
  if (inputMatch && outputMatch) {
    console.log(`  ✓ Input/Output regex matched`);
    console.log(`  Input: ${inputMatch[1].substring(0, 60)}`);
    console.log(`  Output: ${outputMatch[1].substring(0, 40)}\n`);
  } else {
    console.log(`  ✗ Input/Output regex failed`);
    console.log(`    inputMatch: ${!!inputMatch}`);
    console.log(`    outputMatch: ${!!outputMatch}\n`);
  }
}
