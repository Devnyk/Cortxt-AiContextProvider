import fs from "fs";
import path from "path";
import { shouldIgnore } from "../utils/ignore.js";
import { copyToClipboard } from "../utils/clipboard.js";

export async function runTree(options = {}) {
  const maxDepth = parseInt(options.depth) || 3;
  const rootDir = process.cwd();
  
  console.log(`📁 Project Structure (depth: ${maxDepth})\n`);
  
  const tree = buildTree(rootDir, "", maxDepth, 0);
  const projectName = path.basename(rootDir);
  const output = `📁 ${projectName}/\n${tree}`;
  
  console.log(output);
  copyToClipboard(output);
  console.log("\n✅ Project tree copied to clipboard!");
}

function buildTree(dir, prefix = "", maxDepth = 3, currentDepth = 0) {
  if (currentDepth >= maxDepth) return "";
  
  try {
    const files = fs.readdirSync(dir);
    let result = "";
    
    // Filter and sort files
    const validFiles = files.filter(file => {
      const fullPath = path.join(dir, file);
      return !shouldIgnore(fullPath, file, dir);
    }).sort();
    
    validFiles.forEach((file, index) => {
      const fullPath = path.join(dir, file);
      const isLast = index === validFiles.length - 1;
      const connector = isLast ? "└── " : "├── ";
      const nextPrefix = prefix + (isLast ? "    " : "│   ");
      
      try {
        const stat = fs.statSync(fullPath);
        const icon = stat.isDirectory() ? "📁 " : "📄 ";
        result += `${prefix}${connector}${icon}${file}\n`;
        
        if (stat.isDirectory()) {
          result += buildTree(fullPath, nextPrefix, maxDepth, currentDepth + 1);
        }
      } catch (err) {
        // Skip files we can't read
      }
    });
    
    return result;
  } catch (err) {
    return "";
  }
}