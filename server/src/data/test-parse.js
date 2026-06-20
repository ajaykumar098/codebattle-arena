const exampleText = "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].";
const paramNames = ["nums", "target"];

console.log("Testing regex patterns...");
console.log("Example text:", exampleText);
console.log("\nParamNames:", paramNames);

const inputMatch = exampleText.match(/Input:\s*(.+?)(?:\nOutput:|\r?\nOutput:)/s);
console.log("\nInput match:", inputMatch ? inputMatch[1] : "NO MATCH");

const outputMatch = exampleText.match(/Output:\s*(.+?)(?:\nExplanation:|$)/s);
console.log("Output match:", outputMatch ? outputMatch[1] : "NO MATCH");

if (inputMatch && outputMatch) {
  const inputRaw = inputMatch[1].trim();
  const outputRaw = outputMatch[1].trim();
  
  console.log("\nInput raw:", inputRaw);
  console.log("Output raw:", outputRaw);
  
  // Try to parse nums
  const escapedName = "nums".replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const startPattern = new RegExp(`${escapedName}\\s*=\\s*`);
  const startMatch = inputRaw.match(startPattern);
  console.log("\nNums pattern match:", startMatch);
  
  if (startMatch) {
    const startIdx = startMatch.index + startMatch[0].length;
    const nextName = "target";
    const escapedNextName = nextName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const endPattern = new RegExp(`,\\s*${escapedNextName}\\s*=`);
    const endMatch = inputRaw.slice(startIdx).match(endPattern);
    const endIdx = endMatch ? startIdx + endMatch.index : inputRaw.length;
    const rawValue = inputRaw.slice(startIdx, endIdx).trim().replace(/,$/, "");
    console.log("Raw value for nums:", rawValue);
    const parsedNums = Function(`"use strict"; return (${rawValue});`)();
    console.log("Parsed nums:", parsedNums);
  }
}
