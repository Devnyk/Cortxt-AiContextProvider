// src/commands/context.js
import { readProject } from "../utils/read.js";
import { copyToClipboard } from "../utils/clipboard.js";
import { formatBytes, getProjectName } from "../utils/helpers.js";

export async function runContext(options = {}) {
  try {
    console.log("🔍 Scanning project directory...");
    
    const projectName = getProjectName();
    if (projectName) {
      console.log(`📁 Found project: ${projectName}`);
    }

    const startTime = Date.now();
    const result = await readProject(process.cwd(), options);
    
    const files = Object.entries(result.data);
    const fileCount = files.length;
    const totalSize = files.reduce((sum, [, content]) => sum + content.length, 0);
    
    if (fileCount === 0) {
      console.log("❌ No files found to process");
      console.log("💡 Tip: Make sure you're in a project directory");
      return;
    }

    console.log("📄 Processing files... [▓▓▓▓▓▓▓▓▓▓] 100%");
    
    const formatted = files
      .map(([file, code]) => `\n\n### ${file}\n\`\`\`\n${code}\n\`\`\``)
      .join("\n");

    // Show stats
    const processTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ Processed ${fileCount} files (${formatBytes(totalSize)}) in ${processTime}s`);
    
    if (result.skipped > 0) {
      console.log(`⚠️  Skipped ${result.skipped} binary/large files`);
    }

    if (options.stats) {
      showDetailedStats(files, totalSize);
    }

    // Copy to clipboard
    console.log("📋 Copying to clipboard...");
    copyToClipboard(formatted);
    console.log("🎉 Project context ready for your AI assistant!");
    
    // Context window warning
    if (totalSize > 100000) { // ~100KB
      console.log("⚠️  Large context detected - consider using specific files if AI struggles");
    } else {
      console.log("🎯 Perfect size for AI context window!");
    }

    if (options.verbose) {
      console.log(`\n📊 Quick Stats:`);
      console.log(`   Files: ${fileCount}`);
      console.log(`   Size: ${formatBytes(totalSize)}`);
      console.log(`   Estimated tokens: ~${Math.round(totalSize / 4)}`);
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.log("💡 Tip: Make sure you're in a valid project directory");
    process.exit(1);
  }
}

function showDetailedStats(files, totalSize) {
  console.log(`\n📊 Detailed Statistics:`);
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