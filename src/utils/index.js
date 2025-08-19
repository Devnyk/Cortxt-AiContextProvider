import { Command } from "commander";
import { runContext } from "../commands/context.js";
import { runFile } from "../commands/file.js";
import { runDeps } from "../commands/deps.js";
import { runTree } from "../commands/tree.js";
import { runStats } from "../commands/stats.js";

const program = new Command();

// Brand header
function showBrand() {
  console.log("🧠 Cortex v1.0.0 - AI-Friendly Project Context Extractor\n");
}

program
  .name("cortex")
  .description("🧠 AI-friendly CLI to share project context or file code easily")
  .version("1.0.0");

program
  .command("context")
  .description("Extract full project context (all files)")
  .option("-v, --verbose", "show detailed scanning info")
  .option("-s, --stats", "show project statistics")
  .action((options) => {
    showBrand();
    runContext(options);
  });

program
  .command("file <filepath>")
  .description("Extract a specific file")
  .option("-l, --lines", "include line numbers")
  .action((filepath, options) => {
    showBrand();
    runFile(filepath, options);
  });

program
  .command("deps")
  .description("Extract package.json dependencies")
  .option("--dev-only", "include only devDependencies")
  .option("--prod-only", "include only dependencies (production)")
  .action((options) => {
    showBrand();
    runDeps(options);
  });

program
  .command("tree")
  .description("Show project file structure")
  .option("-d, --depth <n>", "maximum depth to show", "3")
  .action((options) => {
    showBrand();
    runTree(options);
  });

program
  .command("stats")
  .description("Show project statistics")
  .action(() => {
    showBrand();
    runStats();
  });

// Custom help
program.configureHelp({
  formatHelp: () => {
    showBrand();
    return `USAGE:
  cortex <command> [options]

COMMANDS:
  context                 Extract full project context (all files)
  file <filepath>         Extract a specific file  
  deps                    Extract package.json dependencies
  tree                    Show project file structure
  stats                   Show project statistics

OPTIONS:
  --verbose, -v           Show detailed output
  --version               Show version number
  --help, -h              Show this help

EXAMPLES:
  cortex context          # Get entire project for AI
  cortex file src/app.js  # Get single file
  cortex deps             # Get only dependencies

💡 Pro tip: All output is automatically copied to clipboard!
`;
  }
});

// Handle no command
program.action(() => {
  showBrand();
  console.log(`💡 Quick start:
  
  cortex context          # Extract full project
  cortex file <path>      # Extract single file
  cortex deps             # Extract dependencies
  cortex --help           # Show all commands
  
🎯 All output is copied to clipboard automatically!`);
});

program.parse(process.argv);