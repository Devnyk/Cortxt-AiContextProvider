// src/commands/context.js
import fs from "fs";
import path from "path";
import ora from "ora";
import { readProject } from "../utils/read.js";
import { copyToClipboard } from "../utils/clipboard.js";
import { formatBytes, getProjectName } from "../utils/helpers.js";
import { colors, ui } from "../utils/colors.js";
import chalk from "chalk";

export async function runContext(options = {}) {
  const spinner = ora({
    text: 'Scanning project...',
    color: 'cyan'
  });

  try {
    spinner.start();

    const projectName = getProjectName();
    const projectType = detectProjectType();

    if (projectName) {
      const displayName = projectType
        ? `${projectName} (${projectType})`
        : projectName;
      spinner.text = `Scanning ${displayName}...`;
    }

    const startTime = Date.now();
    const result = await readProject(process.cwd(), options);

    let files = Object.entries(result.data);
    const originalFileCount = files.length;
    const originalTotalSize = files.reduce(
      (sum, [, content]) => sum + content.length,
      0
    );

    spinner.stop();

    if (originalFileCount === 0) {
      console.log("❌ No files found to process");
      console.log(
        "💡 Not in a project folder? Navigate to your code directory first"
      );
      return;
    }

    // Smart handling for large projects
    if (originalTotalSize > 500000 && !options.force) {
      console.log("🧠 Smart processing for large project...");
      files = handleLargeProject(files, options);
    }

    const processingSpinner = ora({
      text: 'Processing files...',
      color: 'green'
    }).start();

    const finalFileCount = files.length;
    const finalTotalSize = files.reduce(
      (sum, [, content]) => sum + content.length,
      0
    );

    const formatted = files
      .map(([file, code]) => `\n\n### ${file}\n\`\`\`\n${code}\n\`\`\``)
      .join("\n");

    processingSpinner.stop();

    // Show stats
    const processTime = ((Date.now() - startTime) / 1000).toFixed(1);

    if (finalFileCount !== originalFileCount) {
      console.log(
        `✅ Processed ${finalFileCount} priority files (${formatBytes(
          finalTotalSize
        )}) in ${processTime}s`
      );
      console.log(
        `📊 Original: ${originalFileCount} files (${formatBytes(
          originalTotalSize
        )})`
      );
    } else {
      console.log(
        `✅ Processed ${finalFileCount} files (${formatBytes(
          finalTotalSize
        )}) in ${processTime}s`
      );
    }

    if (result.skipped > 0) {
      console.log(`Skipped ${result.skipped} binary/large files`);
    }

    if (options.stats) {
      showDetailedStats(files, finalTotalSize);
    }

    // Copy to clipboard
    const clipboardSuccess = copyToClipboard(formatted);
    if (clipboardSuccess) {
      console.log("📋 Copied to clipboard - Paste to any AI & watch magic ✨");
    }

    // Smart suggestions based on project
    showSmartSuggestions(
      finalTotalSize,
      finalFileCount,
      files,
      originalTotalSize !== finalTotalSize
    );

    if (options.verbose) {
      console.log(
        `\nStats: ${finalFileCount} files, ${formatBytes(
          finalTotalSize
        )}, ~${Math.round(finalTotalSize / 4)} tokens`
      );
    }
  } catch (error) {
    if (spinner.isSpinning) spinner.fail('Failed to scan project');
    
    console.error(`❌ Error: ${error.message}`);
    if (error.code === "ENOENT") {
      console.log(
        "💡 Not in a project folder? Navigate to your code directory first"
      );
    } else {
      console.log("💡 Make sure you're in a valid project directory");
    }
    process.exit(1);
  }
}

function handleLargeProject(files, options) {
  // Priority order for files
  const filePriority = {
    "package.json": 100,
    "README.md": 90,
    "index.js": 80,
    "main.js": 80,
    "app.js": 80,
    "server.js": 75,
  };

  // Get file priority score
  function getFilePriority(filename) {
    // Exact match
    if (filePriority[filename]) return filePriority[filename];

    // Extension-based priority
    const ext = path.extname(filename).toLowerCase();
    const extensionPriority = {
      ".js": 70,
      ".ts": 70,
      ".jsx": 65,
      ".tsx": 65,
      ".vue": 60,
      ".py": 60,
      ".go": 55,
      ".rs": 55,
      ".md": 50,
      ".json": 30,
      ".yaml": 25,
      ".yml": 25,
    };

    return extensionPriority[ext] || 20;
  }

  // Truncate very large files
  function truncateIfNeeded(content, filename, maxLength = 5000) {
    if (content.length <= maxLength) return content;

    const truncated = content.substring(0, maxLength);
    const lastNewline = truncated.lastIndexOf("\n");
    const safeContent =
      lastNewline > 0 ? truncated.substring(0, lastNewline) : truncated;

    return `${safeContent}\n\n// ... (file truncated - showing first ${safeContent.length} of ${content.length} characters)\n// Use 'cortxt file ${filename}' for complete content`;
  }

  // Sort files by priority
  const prioritizedFiles = files
    .map(([file, content]) => ({
      file,
      content,
      priority: getFilePriority(path.basename(file)),
    }))
    .sort((a, b) => b.priority - a.priority);

  // Get size limit
  const maxSizeBytes = parseInt(options.maxSize) * 1024;
  let currentSize = 0;
  const selectedFiles = [];

  for (const { file, content } of prioritizedFiles) {
    const truncatedContent = truncateIfNeeded(content, file);
    const contentSize = truncatedContent.length;

    if (currentSize + contentSize <= maxSizeBytes) {
      selectedFiles.push([file, truncatedContent]);
      currentSize += contentSize;
    } else if (selectedFiles.length === 0) {
      // Always include at least one file
      selectedFiles.push([file, truncatedContent]);
      break;
    } else {
      break;
    }
  }

  return selectedFiles;
}

function showDetailedStats(files, totalSize) {
  console.log(`\n${colors.brand.bold("📊 Detailed Statistics:")}`);
  
  // File extensions breakdown
  const extensions = {};
  files.forEach(([file]) => {
    const ext = path.extname(file) || "no extension";
    extensions[ext] = (extensions[ext] || 0) + 1;
  });

  console.log(`${colors.info("File types:")}`);
  Object.entries(extensions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .forEach(([ext, count]) => {
      console.log(`  ${colors.filename(ext.padEnd(12))} ${colors.number(count)} files`);
    });

  // Largest files
  console.log(`\n${colors.info("Largest files:")}`);
  files
    .map(([file, content]) => [file, content.length])
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .forEach(([file, size]) => {
      console.log(`  ${colors.filename(file.padEnd(25))} ${colors.size(formatBytes(size))}`);
    });
}

function showSmartSuggestions(
  finalTotalSize,
  finalFileCount,
  files,
  wasFiltered
) {
  console.log(`\n${colors.info("💡 Smart Suggestions:")}`);

  if (finalTotalSize > 200000) {
    console.log(
      `${colors.warning("⚠️  Large context size detected")} - Consider using ${colors.brand("cortxt file")} for specific files`
    );
  }

  if (wasFiltered) {
    console.log(
      `${colors.info("🎯 Smart filtering applied")} - Use ${colors.brand("--force")} to include all files`
    );
  }

  // Detect common files that might be useful
  const hasTests = files.some(([file]) =>
    file.includes("test") || file.includes("spec")
  );
  const hasConfig = files.some(([file]) =>
    file.includes("config") || file.includes(".config")
  );

  if (!hasTests && hasConfig) {
    console.log(
      `${colors.info("🧪 No test files found")} - Consider adding test files to your project context`
    );
  }

  if (finalFileCount < 5) {
    console.log(
      `${colors.info("📁 Small project detected")} - Perfect size for AI analysis!`
    );
  }
}

function detectProjectType() {
  try {
    const cwd = process.cwd();
    
    if (fs.existsSync(path.join(cwd, "package.json"))) {
      const pkg = JSON.parse(fs.readFileSync(path.join(cwd, "package.json"), "utf-8"));
      
      if (pkg.dependencies || pkg.devDependencies) {
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        
        if (deps.next) return "Next.js";
        if (deps.react) return "React";
        if (deps.vue) return "Vue.js";
        if (deps.express) return "Express";
        if (deps.nuxt) return "Nuxt.js";
        if (deps.gatsby) return "Gatsby";
        if (deps.angular || deps["@angular/core"]) return "Angular";
      }
      
      return "Node.js";
    }
    
    if (fs.existsSync(path.join(cwd, "requirements.txt")) || 
        fs.existsSync(path.join(cwd, "pyproject.toml"))) {
      return "Python";
    }
    
    if (fs.existsSync(path.join(cwd, "Cargo.toml"))) {
      return "Rust";
    }
    
    if (fs.existsSync(path.join(cwd, "go.mod"))) {
      return "Go";
    }
    
    if (fs.existsSync(path.join(cwd, "composer.json"))) {
      return "PHP";
    }
    
    return null;
  } catch {
    return null;
  }
}