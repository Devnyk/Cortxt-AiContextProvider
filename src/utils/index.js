import { Command } from "commander";
import { runContext } from "../commands/context.js";
import { runFile } from "../commands/file.js";
import { runDeps } from "../commands/deps.js";
import { runTree } from "../commands/tree.js";
import { runStats } from "../commands/stats.js";

const program = new Command();

// Brand header
function showBrand() {
  console.log("\n📦 Cortex v1.0.0 - Project Context CLI\n");
}

program
  .name("cortex")
  .description("🧠 AI-friendly CLI to share project context or file code easily")
  .version("1.0.0");

program
  .command("context")
  .description("📁 Extract full project (all files & code)")
  .option("-v, --verbose", "show detailed scanning info")
  .option("-s, --stats", "show project statistics")
  .action((options) => {
    showBrand();
    runContext(options);
  });

program
  .command("file <filepath>")
  .description("📄 Extract a single file's code")
  .option("-l, --lines", "include line numbers")
  .action((filepath, options) => {
    showBrand();
    runFile(filepath, options);
  });

program
  .command("deps")
  .description("📦 Extract only dependencies from package.json")
  .option("--dev-only", "include only devDependencies")
  .option("--prod-only", "include only dependencies (production)")
  .action((options) => {
    showBrand();
    runDeps(options);
  });

program
  .command("tree")
  .description("🌲 Show project folder structure")
  .option("-d, --depth <n>", "maximum depth to show", "3")
  .action((options) => {
    showBrand();
    runTree(options);
  });

program
  .command("stats")
  .description("📊 Show project statistics (files, lines, size)")
  .action(() => {
    showBrand();
    runStats();
  });

// Custom help - Simple and clean like your example
program.configureHelp({
  formatHelp: () => {
    return `🧠 Cortex v1.0.0 - Project Context Made Simple
USAGE:
  cortex <command> [options]

COMMANDS:
  context                 Extract full project (all files & code)
  file <filepath>         Extract a single file's code
  deps                    Extract only dependencies from package.json
  tree                    Show project folder structure
  stats                   Show project statistics (files, lines, size)

OPTIONS:
  --version               Show version number
  --help, -h              Show help for a command

EXAMPLES:
  cortex context          # Copy entire project code to clipboard
  cortex file src/app.js  # Copy only one file's code
  cortex deps             # Copy dependencies
  cortex tree             # Show folder structure
  cortex stats            # Show project stats

✨ All output is automatically copied to clipboard!`;
  }
});

// Handle no command - Simple quick start
program.action(() => {
  console.log(`--Cortex Quick Start 🛺
  cortex context          # Extract all code
  cortex file <path>      # Extract one file  
  cortex deps             # Extract dependencies
  cortex tree             # Show folder structure
  cortex stats            # Show project stats

✨ Output is copied to clipboard automatically.`);
});

program.parse(process.argv);