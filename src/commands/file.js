import fs from "fs";
import path from "path";
import { copyToClipboard } from "../utils/clipboard.js";

export async function runFile(filePath) {
  const absPath = path.resolve(process.cwd(), filePath);
  const code = fs.readFileSync(absPath, "utf-8");

  const formatted = `\n\n### ${filePath}\n\`\`\`\n${code}\n\`\`\``;

  console.log(formatted);
  copyToClipboard(formatted);
  console.log(`\n✅ File "${filePath}" copied to clipboard!`);
}
