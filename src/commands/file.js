import fs from "fs";
import path from "path";
import ora from "ora";
import chalk from "chalk";
import { copyToClipboard } from "../utils/clipboard.js";
import { formatBytes } from "../utils/helpers.js";
import { colors } from "../utils/colors.js";
import { shouldIgnore } from "../utils/ignore.js";
import { Dropdown } from "../utils/interactive.js";

export async function runFile(filePath, options = {}) {
  try {
    if (!filePath) {
      await interactiveFileSelection(options);
      return;
    }
    await processFiles([filePath], options);
  } catch (error) {
    handleError(error, filePath);
  }
}

async function interactiveFileSelection(options) {
  const spinner = ora({ text: "Scanning project files...", color: "cyan" }).start();

  try {
    const files = await getAllProjectFiles();
    spinner.stop();

    if (files.length === 0) {
      console.log(`${colors.warningIcon || "⚠️"} ${colors.warning("No files found in the project")}`);
      return;
    }

    console.log(`${colors.info("Found")} ${colors.number(files.length)} ${colors.info("files in project")}\n`);

    if (options.multiple) {
      await selectMultipleFiles(files, options);
    } else {
      await selectSingleFile(files, options);
    }
  } catch (error) {
    spinner.fail("Failed to scan project files");
    throw error;
  }
}

async function selectSingleFile(files, options) {
  const dropdown = new Dropdown(
    files.map((f) => ({
      label: formatFileChoice(f),
      value: f.path,
    }))
  );

  dropdown.run(async (selected) => {
    if (!selected || selected.length === 0) {
      console.log(colors.warning("⚠️ No file selected. Try again!"));
      return;
    }
    await processFiles([selected[0]], options);
  });
}

async function selectMultipleFiles(files, options) {
  const dropdown = new Dropdown(
    files.map((f) => ({
      label: `${chalk.dim(f.directory !== "." ? f.directory + "/" : "")}${colors.filename(f.name)} ${chalk.dim("(" + formatBytes(f.size) + ")")}`,
      value: f.path,
    })),
    { multi: true } // ✅ enable multi-select
  );

  dropdown.run(async (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) {
      console.log(colors.warning("⚠️ No files selected. Use <space> to select, then <enter> to confirm."));
      return;
    }
    await processFiles(selectedFiles, options);
  });
}

/**
 * ✅ The missing function that actually processes files
 */
async function processFiles(filePaths, options) {
  let totalContent = "";
  let totalSize = 0;
  let processedCount = 0;

  console.log(`${colors.info("Processing")} ${colors.number(filePaths.length)} ${colors.info("file(s)...")}\n`);

  for (const filePath of filePaths) {
    try {
      const absPath = path.resolve(process.cwd(), filePath);
      const code = fs.readFileSync(absPath, "utf-8");

      const fileSize = Buffer.byteLength(code, "utf8");
      const lineCount = code.split("\n").length;

      console.log(`${colors.filename("📄 " + filePath)}`);
      console.log(
        `   ${colors.info("Size:")} ${colors.size(formatBytes(fileSize))} | ${colors.info("Lines:")} ${colors.number(lineCount)}`
      );

      let fileContent;
      if (options.lines) {
        const numberedCode = code
          .split("\n")
          .map((line, index) => `${String(index + 1).padStart(3, " ")}: ${line}`)
          .join("\n");
        fileContent = `\n\n### ${filePath} (with line numbers)\n\`\`\`\n${numberedCode}\n\`\`\``;
      } else {
        fileContent = `\n\n### ${filePath}\n\`\`\`\n${code}\n\`\`\``;
      }

      totalContent += fileContent;
      totalSize += fileSize;
      processedCount++;
    } catch (error) {
      console.log(`   ${colors.error("❌ Error reading file:")} ${error.message}`);
    }
  }

  if (processedCount === 0) {
    console.log(`${colors.error("❌ No files were successfully processed")}`);
    return;
  }

  copyToClipboard(totalContent);

  console.log(`\n${colors.success("✅ Successfully processed")} ${colors.number(processedCount)} ${colors.success("file(s)")}`);
  console.log(`${colors.info("📊 Total size:")} ${colors.size(formatBytes(totalSize))}`);
  console.log(`${colors.success("📋 Content copied to clipboard!")} ${colors.brand("Ready for AI analysis")} ✨`);

  if (processedCount > 1) {
    console.log(`\n${colors.info("📁 Files included:")}`);
    filePaths.slice(0, 5).forEach((file, index) => {
      console.log(`   ${colors.number(index + 1 + ".")} ${colors.filename(file)}`);
    });
    if (filePaths.length > 5) {
      console.log(`   ${chalk.dim("... and " + (filePaths.length - 5) + " more files")}`);
    }
  }
}

async function getAllProjectFiles() {
  const files = [];
  const rootDir = process.cwd();

  function walkDirectory(dir, relativePath = "") {
    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relPath = path.join(relativePath, item);

        if (shouldIgnore(fullPath, item, rootDir)) continue;

        try {
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            walkDirectory(fullPath, relPath);
          } else if (stat.isFile()) {
            if (stat.size > 1024 * 1024) continue; // skip >1MB
            if (isTextFile(item)) {
              files.push({
                path: relPath,
                name: item,
                size: stat.size,
                directory: path.dirname(relPath) || ".",
                fullPath,
              });
            }
          }
        } catch {
          continue;
        }
      }
    } catch {
      return;
    }
  }

  walkDirectory(rootDir);

  files.sort((a, b) => {
    if (a.directory !== b.directory) return a.directory.localeCompare(b.directory);
    return a.name.localeCompare(b.name);
  });

  return files;
}

function formatFileChoice(file) {
  const sizeStr = formatBytes(file.size);
  const dirStr = file.directory === "." ? "" : `${chalk.gray(file.directory + "/")}`;
  return `${dirStr}${colors.filename(file.name)} ${chalk.dim("(" + sizeStr + ")")}`;
}

function isTextFile(filename) {
  const textExtensions = [
    ".js", ".jsx", ".ts", ".tsx", ".vue",
    ".py", ".rb", ".php", ".java", ".c", ".cpp",
    ".h", ".hpp", ".cs", ".go", ".rs", ".swift", ".kt",
    ".html", ".css", ".scss", ".sass", ".less",
    ".xml", ".json", ".yaml", ".yml", ".md", ".txt", ".csv",
    ".ini", ".cfg", ".conf", ".env", ".gitignore",
    ".sh", ".bash", ".zsh", ".fish", ".ps1", ".bat", ".cmd",
    ".sql", ".prisma", ".graphql", ".proto", ".dockerfile",
  ];
  const ext = path.extname(filename).toLowerCase();
  return textExtensions.includes(ext) || !path.extname(filename);
}

function handleError(error, filePath) {
  const errorIcon = colors.errorIcon || "❌";
  const errorColor = colors.error || ((t) => t);
  const warningIcon = colors.warningIcon || "⚠️";
  const warningColor = colors.warning || ((t) => t);
  const brandBold = colors.brand?.bold || colors.brand || ((t) => t);

  console.error(`${errorIcon} ${errorColor("Error:")} ${error.message}`);

  if (error.code === "ENOENT") {
    console.log(`${warningIcon} ${warningColor(`File "${filePath}" not found`)}`);
    console.log("💡 Check the file path and try again");
  } else if (error.code === "EISDIR") {
    console.log(`${warningIcon} ${warningColor(`"${filePath}" is a directory, not a file`)}`);
    console.log(`💡 Try: ${brandBold("cortxt tree")} to see directory structure`);
  }
  process.exit(1);
}

