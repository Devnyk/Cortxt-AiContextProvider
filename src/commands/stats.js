import path from "path";
import { readProject } from "../utils/read.js";
import { formatBytes } from "../utils/helpers.js";
import { copyToClipboard } from "../utils/clipboard.js";

export async function runStats() {
  console.log("📊 Analyzing project...");
  
  const data = await readProject(process.cwd());
  const files = Object.entries(data);
  
  // Calculate statistics
  const totalFiles = files.length;
  const totalSize = files.reduce((sum, [, content]) => sum + content.length, 0);
  const totalLines = files.reduce((sum, [, content]) => sum + content.split('\n').length, 0);
  
  // File extensions
  const extensions = {};
  files.forEach(([file]) => {
    const ext = path.extname(file) || 'no extension';
    extensions[ext] = (extensions[ext] || 0) + 1;
  });
  
  // Build output
  const output = `📊 Project Statistics
━━━━━━━━━━━━━━━━━━━━
📁 Total files: ${totalFiles}
💾 Total size: ${formatBytes(totalSize)}
🔤 Lines of code: ${totalLines.toLocaleString()}

File Types:
${Object.entries(extensions)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 8)
  .map(([ext, count]) => {
    const percentage = ((count / totalFiles) * 100).toFixed(1);
    return `  ${ext.padEnd(8)} ${count.toString().padStart(2)} files (${percentage}%)`;
  }).join('\n')}

Top 5 Largest Files:
${files
  .map(([file, content]) => [file, content.length])
  .sort(([,a], [,b]) => b - a)
  .slice(0, 5)
  .map(([file, size]) => `  ${file.padEnd(30)} ${formatBytes(size)}`)
  .join('\n')}`;

  console.log(output);
  copyToClipboard(output);
  console.log("\n✅ Project statistics copied to clipboard!");
}