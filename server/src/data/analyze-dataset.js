require("dotenv").config();
const fs = require("fs");
const path = require("path");

const RAW_PATH = path.join(__dirname, "..", "data", "leetcode-raw.json");

const raw = JSON.parse(fs.readFileSync(RAW_PATH, "utf8"));
const questions = Array.isArray(raw) ? raw : raw.questions;

console.log(`Total problems in dataset: ${questions.length}`);
console.log("\nAnalyzing first 5 problems...\n");

for (let i = 0; i < 5; i++) {
  const q = questions[i];
  console.log(`Problem ${i + 1}: ${q.title}`);
  console.log(`Has JS snippet: ${!!(q.code_snippets && q.code_snippets.javascript)}`);
  console.log(`Number of examples: ${q.examples ? q.examples.length : 0}`);
  
  if (q.examples && q.examples.length > 0) {
    console.log(`First example text:\n${q.examples[0].example_text}\n`);
  }
  
  if (q.code_snippets && q.code_snippets.javascript) {
    const snippet = q.code_snippets.javascript;
    console.log(`JS Snippet:\n${snippet.substring(0, 200)}...\n`);
  }
  
  console.log("---\n");
}
