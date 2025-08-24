import { Command } from "commander";
import { runContext } from "../commands/context.js";
import { runFile } from "../commands/file.js";
import { runDeps } from "../commands/deps.js";
import { runTree } from "../commands/tree.js";
import { runStats } from "../commands/stats.js";
import { runIgnore } from "../commands/ignore.js";
import { colors } from "../utils/colors.js";

const program = new Command();

// Brand header
function showBrand() {
  console.log(`\n${colors.brand('📦 Cortxt v1.0.5')} - ${colors.info('Fastest way to provide project context to AI intelligence.')}\n`);
}

program
  .name("cortxt")
  .description("🧠 Cortxt – Simplest way to share project context with AI.")
  .version("1.0.5");

program
  .command("context")
  .description("📁 Extract full project (all files & code)")
  .option("-v, --verbose", "show detailed scanning info")
  .option("-s, --stats", "show project statistics")
  .option("--force", "include all files regardless of size")
  .option("--max-size <size>", "maximum total size in KB (default: 400)", "400")
  .action((options) => {
    showBrand();
    runContext(options);
  });

program
  .command("file [filepath]")
  .description("📄 Extract file(s) - Interactive selection if no path provided")
  .option("-l, --lines", "include line numbers")
  .option("-m, --multiple", "select multiple files interactively")
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

program
  .command("ignore")
  .description("🚫 Manage ignored files and patterns")
  .option("-a, --add <pattern>", "add pattern to ignore")
  .option("-r, --remove <pattern>", "remove pattern from ignore")
  .option("-l, --list", "list all ignored patterns")
  .option("--reset", "reset to default ignore patterns")
  .action((options) => {
    showBrand();
    runIgnore(options);
  });

// Custom help - Simple and clean with strategic highlighting
program.configureHelp({
  formatHelp: () => {
    return `${colors.brand.bold('Cortxt Help Commands')} 🤝

${colors.info('USAGE:')}
  ${colors.brand('cortxt')} <command> [options]

${colors.info('COMMANDS:')}
  ${colors.filename('context')}                 Extract full project (all files & code)
  ${colors.filename('file [filepath]')}         Extract file(s) - Interactive if no path
  ${colors.filename('deps')}                    Extract only dependencies from package.json
  ${colors.filename('tree')}                    Show project folder structure
  ${colors.filename('stats')}                   Show project statistics (files, lines, size)
  ${colors.filename('ignore')}                  Manage ignored files and patterns

${colors.info('CONTEXT OPTIONS:')}
  -v, --verbose           Show detailed scanning info
  -s, --stats             Show project statistics
  --force                 Include all files regardless of size
  --max-size <size>       Maximum total size in KB (default: 400)

${colors.info('FILE OPTIONS:')}
  -l, --lines             Include line numbers
  -m, --multiple          Select multiple files interactively

${colors.info('IGNORE OPTIONS:')}
  -a, --add <pattern>     Add pattern to ignore list
  -r, --remove <pattern>  Remove pattern from ignore list
  -l, --list              List all ignored patterns
  --reset                 Reset to default ignore patterns

${colors.info('EXAMPLES:')}
  ${colors.brand('cortxt context')}              # Copy entire project code to clipboard
  ${colors.brand('cortxt file')}                 # Interactive file selection
  ${colors.brand('cortxt file --multiple')}      # Select multiple files interactively
  ${colors.brand('cortxt file src/app.js')}      # Copy specific file
  ${colors.brand('cortxt ignore --add "*.log"')} # Ignore all .log files
  ${colors.brand('cortxt ignore --list')}        # Show ignored patterns
  ${colors.brand('cortxt deps')}                 # Copy dependencies
  ${colors.brand('cortxt tree')}                 # Show folder structure
  ${colors.brand('cortxt stats')}                # Show project stats

${colors.success('✨ All output is automatically copied to clipboard!')}`;
  }
});

// Handle no command - Simple quick start with highlighting
program.action(() => {
  console.log(`${colors.info('--->>>>> 👉 Cortxt Quick Commands 👇 <<<<<---')}

  ${colors.brand.bold('cortxt context')}          # Extract all code (smart filtering)
  ${colors.brand.bold('cortxt file --multiple')}  # Select multiple files
  ${colors.brand.bold('cortxt deps')}             # Extract dependencies
  ${colors.brand.bold('cortxt tree')}             # Show folder structure
  ${colors.brand.bold('cortxt stats')}            # Show project stats
  ${colors.brand.bold('cortxt --help')}           # Show help

${colors.success('✨ Output is copied to clipboard automatically.')}`);
});

program.parse(process.argv);