// src/commands/context.js
import fs from "fs";
import path from "path";
import { readProject } from "../utils/read.js";
import { copyToClipboard } from "../utils/clipboard.js";
import { formatBytes, getProjectName } from "../utils/helpers.js";
import { colors, ui } from "../utils/colors.js";
import chalk from "chalk";

export async function runContext(options = {}) {
  try {
    console.log("🔍 Scanning project...");
    
    const projectName = getProjectName();
    const projectType = detectProjectType();
    
    if (projectName) {
      const displayName = projectType ? `${projectName} (${projectType})` : projectName;
      console.log(`Project: ${displayName}`);
    }

    const startTime = Date.now();
    const result = await readProject(process.cwd(), options);
    
    const files = Object.entries(result.data);
    const fileCount = files.length;
    const totalSize = files.reduce((sum, [, content]) => sum + content.length, 0);
    
    if (fileCount === 0) {
      console.log("❌ No files found to process");
      console.log("💡 Not in a project folder? Navigate to your code directory first");
      return;
    }

    console.log("Processing files...");
    
    const formatted = files
      .map(([file, code]) => `\n\n### ${file}\n\`\`\`\n${code}\n\`\`\``)
      .join("\n");

    // Show stats
    const processTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ Processed ${fileCount} files (${formatBytes(totalSize)}) in ${processTime}s`);
    
    if (result.skipped > 0) {
      console.log(`Skipped ${result.skipped} binary/large files`);
    }

    if (options.stats) {
      showDetailedStats(files, totalSize);
    }

    // Copy to clipboard
    copyToClipboard(formatted);
    console.log("📋 Copied to clipboard - Paste to any AI & watch magic ✨");
    
    // Smart suggestions based on project
    showSmartSuggestions(totalSize, fileCount, files);

    if (options.verbose) {
      console.log(`\nStats: ${fileCount} files, ${formatBytes(totalSize)}, ~${Math.round(totalSize / 4)} tokens`);
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    if (error.code === 'ENOENT') {
      console.log("💡 Not in a project folder? Navigate to your code directory first");
    } else {
      console.log("💡 Make sure you're in a valid project directory");
    }
    process.exit(1);
  }
}

function detectProjectType() {
  const cwd = process.cwd();
  const hasFile = (name) => fs.existsSync(path.join(cwd, name));
  
  if (hasFile('package.json')) {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf-8'));
      
      // React/Next.js
      if (pkg.dependencies?.react || pkg.dependencies?.next) {
        return hasFile('next.config.js') ? '⚛️ Next.js' : '⚛️ React';
      }
      
      // Vue.js
      if (pkg.dependencies?.vue || hasFile('vue.config.js')) {
        return '🟢 Vue.js';
      }
      
      // Node.js API
      if (pkg.dependencies?.express || pkg.dependencies?.fastify) {
        return '🚀 Node.js API';
      }
      
      return '📦 Node.js';
    } catch {
      return '📦 Node.js';
    }
  }
  
  if (hasFile('requirements.txt') || hasFile('setup.py')) {
    return '🐍 Python';
  }
  
  if (hasFile('Cargo.toml')) {
    return '🦀 Rust';
  }
  
  if (hasFile('go.mod')) {
    return '🐹 Go';
  }
  
  return null;
}

function showSmartSuggestions(totalSize, fileCount, files) {
  // Large project suggestion
  if (totalSize > 200000) {
    const mainFiles = files.filter(([file]) => 
      file.includes('index.') || file.includes('main.') || file.includes('app.')
    );
    if (mainFiles.length > 0) {
      console.log(`💡 Project is large! Try: ${colors.brand.bold('cortxt file ' + mainFiles[0][0])} for focused help`);
    } else {
      console.log(`💡 Project is large! Try: ${colors.brand.bold('cortxt file <specific-file>')} for focused help`);
    }
  } 
  // Small project
  else if (fileCount < 3) {
    console.log("💡 Small project detected. Perfect for AI analysis!");
  }
  // Medium project with package.json
  else if (fs.existsSync(path.join(process.cwd(), "package.json"))) {
    console.log(`💡 Need help? Try ${colors.brand.bold('cortxt --help')} 🤝`);
  }
}

function showDetailedStats(files, totalSize) {
  console.log(`\nDetailed Statistics:`);
  console.log(`━━━━━━━━━━━━━━━━━━━━`);
  
  // File type breakdown
  const extensions = {};
  files.forEach(([file]) => {
    const ext = file.split('.').pop() || 'no extension';
    extensions[ext] = (extensions[ext] || 0) + 1;
  });

  console.log(`File Types:`);
  Object.entries(extensions)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .forEach(([ext, count]) => {
      const percentage = ((count / files.length) * 100).toFixed(1);
      console.log(`  .${ext.padEnd(6)} ${count.toString().padStart(2)} files (${percentage}%)`);
    });

  // Largest files
  const sortedBySize = files
    .map(([file, content]) => [file, content.length])
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  console.log(`\nLargest Files:`);
  sortedBySize.forEach(([file, size]) => {
    console.log(`  ${file.padEnd(25)} ${formatBytes(size)}`);
  });
}