/**
 * importProblems.js
 *
 * Converts a slice of server/src/data/leetcode-raw.json into your Problem schema
 * and upserts them into MongoDB.
 *
 * IMPORTANT — read before running at scale:
 * This script auto-parses "example_text" strings into structured test cases.
 * That parsing is the riskiest part of this whole pipeline — it works well for
 * simple "Input: x = ..., y = ...\nOutput: ..." patterns (the majority of easy/medium
 * array & string problems), but WILL fail or produce garbage for:
 * - Problems with object/tree/graph inputs (e.g. "root = [1,2,3]" representing a tree)
 * - Problems with multiple valid outputs (e.g. "any order is accepted")
 * - Problems whose examples don't follow the "Input:/Output:" text pattern exactly
 * - Multi-function-entry-point problems (e.g. design a class with multiple methods)
 *
 * This script DELIBERATELY skips (does not insert) any problem it cannot confidently
 * parse, and logs a count + list of skipped slugs at the end. That is intentional —
 * it is far better to import 150 problems you can trust than 300 where some silently
 * have broken test cases that mark correct solutions as wrong.
 *
 * Run with: node importProblems.js
 * Adjust BATCH_SIZE below to control how many problems get attempted per run.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Adjust this path if your raw file lives elsewhere
const RAW_PATH = path.join(__dirname, "..", "data", "leetcode-raw.json");

// Start small. Increase once you've verified a batch works well.
const BATCH_SIZE = 500;

// Only import problems whose JS starter code matches a simple function signature.
// This filters out class-based / multi-method problems automatically.
const JS_FUNCTION_PATTERN = /var\s+([a-zA-Z0-9_]+)\s*=\s*function\s*\((.*?)\)/;

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Attempts to parse a single example_text block like:
 * "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: ..."
 * into { argsInOrder: [val1, val2, ...], output: val }
 *
 * paramNames = ["nums", "target"] (extracted from the JS function signature)
 * Returns null if parsing fails — caller should treat that as "skip this example."
 */
function parseExampleText(exampleText, paramNames) {
  const inputMatch = exampleText.match(/Input:\s*(.+?)(?:\nOutput:|\r?\nOutput:)/s);
  const outputMatch = exampleText.match(/Output:\s*(.+?)(?:\nExplanation:|$)/s);

  if (!inputMatch || !outputMatch) return null;

  const inputRaw = inputMatch[1].trim();
  const outputRaw = outputMatch[1].trim();

  const args = [];
  for (let i = 0; i < paramNames.length; i++) {
    const name = paramNames[i];
    const nextName = paramNames[i + 1];

    const startPattern = new RegExp(`${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*=\\s*`);
    const startMatch = inputRaw.match(startPattern);
    if (!startMatch) return null;

    const startIdx = startMatch.index + startMatch[0].length;
    let endIdx;
    if (nextName) {
      const endPattern = new RegExp(`,\\s*${nextName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*=`);
      const endMatch = inputRaw.slice(startIdx).match(endPattern);
      endIdx = endMatch ? startIdx + endMatch.index : inputRaw.length;
    } else {
      endIdx = inputRaw.length;
    }

    const rawValue = inputRaw.slice(startIdx, endIdx).trim().replace(/,$/, "");

    let parsedValue;
    try {
      parsedValue = Function(`"use strict"; return (${rawValue});`)();
    } catch (err) {
      return null;
    }
    args.push(parsedValue);
  }

  let parsedOutput;
  try {
    parsedOutput = Function(`"use strict"; return (${outputRaw});`)();
  } catch (err) {
    return null;
  }

  return { args, output: parsedOutput };
}

async function run() {
  if (!fs.existsSync(RAW_PATH)) {
    console.error(`Raw data file not found at ${RAW_PATH}`);
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(RAW_PATH, "utf8"));
  const questions = Array.isArray(raw) ? raw : raw.questions;

  if (!Array.isArray(questions)) {
    console.error("Could not find a questions array in the raw data file.");
    process.exit(1);
  }

  console.log(`Loaded ${questions.length} raw problems. Attempting first ${BATCH_SIZE}.`);

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  const Problem = require("../models/Problem");

  let imported = 0;
  let skipped = [];

  for (const q of questions.slice(0, BATCH_SIZE)) {
    try {
      const jsSnippet = q.code_snippets && q.code_snippets.javascript;
      if (!jsSnippet) {
        skipped.push({ title: q.title, reason: "no javascript snippet" });
        continue;
      }

      // Skip problems with custom structures (linked lists, trees, etc.)
      if (jsSnippet.includes("Definition for")) {
        skipped.push({ title: q.title, reason: "non-primitive input/output type (linked list, tree, or custom structure)" });
        continue;
      }

      const fnMatch = jsSnippet.match(JS_FUNCTION_PATTERN);
      if (!fnMatch) {
        skipped.push({ title: q.title, reason: "non-standard function signature (likely class-based)" });
        continue;
      }

      const functionName = fnMatch[1];
      const paramNames = fnMatch[2]
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      if (paramNames.length === 0) {
        skipped.push({ title: q.title, reason: "no parameters detected" });
        continue;
      }

      if (!Array.isArray(q.examples) || q.examples.length === 0) {
        skipped.push({ title: q.title, reason: "no examples present" });
        continue;
      }

      const parsedExamples = [];
      for (const ex of q.examples) {
        const parsed = parseExampleText(ex.example_text, paramNames);
        if (parsed) parsedExamples.push(parsed);
      }

      if (parsedExamples.length === 0) {
        skipped.push({ title: q.title, reason: "could not parse any examples" });
        continue;
      }

      const testCases = parsedExamples.map((pe, idx) => ({
        input: JSON.stringify(pe.args),
        expectedOutput: JSON.stringify(pe.output),
        isHidden: idx !== 0,
      }));

      const examplesForDisplay = q.examples.slice(0, 2).map((ex) => {
        const lines = ex.example_text.split("\n");
        const inputLine = lines.find((l) => l.startsWith("Input:")) || "";
        const outputLine = lines.find((l) => l.startsWith("Output:")) || "";
        const explanationLine = lines.find((l) => l.startsWith("Explanation:")) || "";
        return {
          input: inputLine.replace("Input:", "").trim(),
          output: outputLine.replace("Output:", "").trim(),
          explanation: explanationLine.replace("Explanation:", "").trim() || undefined,
        };
      });

      const difficulty = ["Easy", "Medium", "Hard"].includes(q.difficulty) ? q.difficulty : "Easy";

      const problemDoc = {
        title: q.title,
        slug: q.problem_slug || slugify(q.title),
        description: q.description || "",
        difficulty,
        tags: Array.isArray(q.topics) ? q.topics : [],
        functionName,
        examples: examplesForDisplay,
        testCases,
        starterCode: jsSnippet,
      };

      await Problem.findOneAndUpdate({ slug: problemDoc.slug }, problemDoc, {
        upsert: true,
        new: true,
      });

      imported++;
      console.log(`✓ Imported: ${problemDoc.title} (${problemDoc.slug})`);
    } catch (err) {
      skipped.push({ title: q.title, reason: `unexpected error: ${err.message}` });
    }
  }

  console.log("\n--- Import Summary ---");
  console.log(`Imported: ${imported}`);
  console.log(`Skipped: ${skipped.length}`);
  if (skipped.length > 0) {
    console.log("\nSkipped problems (review if you expected these to import):");
    skipped.forEach((s) => console.log(`  - ${s.title}: ${s.reason}`));
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
