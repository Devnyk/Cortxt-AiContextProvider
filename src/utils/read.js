import fs from "fs";
import path from "path";
import { shouldIgnore } from "./ignore.js";

export async function readProject(rootDir, options = {}) {
  const data = {};
  let skipped = 0;
  
  if (!fs.existsSync(rootDir)) {
    console.error(`❌ Directory not found: ${rootDir}`);
    process.exit(1);
  }

  function walk(dir) {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const relPath = path.relative(rootDir, fullPath);

        if (shouldIgnore(fullPath, file, rootDir)) continue;

        try {
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            walk(fullPath);
          } else {
            // Skip very large files unless force option is used
            if (stat.size > 1024 * 1024 && !options.force) { 
              skipped++;
              continue;
            }
            
            // Skip binary files
            if (isBinaryFile(file)) {
              skipped++;
              continue;
            }
            
            try {
              const content = fs.readFileSync(fullPath, "utf-8");
              data[relPath] = content;
            } catch (err) {
              // If we can't read as UTF-8, it's probably binary
              skipped++;
              continue;
            }
          }
        } catch (err) {
          console.warn(`⚠️  Skipping ${relPath}: ${err.message}`);
          skipped++;
        }
      }
    } catch (err) {
      console.warn(`⚠️  Cannot read directory ${dir}: ${err.message}`);
    }
  }

  walk(rootDir);
  return { data, skipped };
}

function isBinaryFile(filename) {
  const binaryExtensions = [
    '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg', '.ico', '.webp',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.zip', '.tar', '.gz', '.rar', '.7z',
    '.exe', '.dll', '.so', '.dylib',
    '.mp3', '.mp4', '.avi', '.mov', '.wmv', '.flv',
    '.ttf', '.otf', '.woff', '.woff2',
    '.class', '.jar', '.war',
    '.o', '.obj', '.lib', '.a',
    '.node', '.pyc', '.pyo'
  ];
  
  const ext = path.extname(filename).toLowerCase();
  return binaryExtensions.includes(ext);
}