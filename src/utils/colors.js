import chalk from "chalk";

// Brand colors and styles
export const colors = {
  // Brand
  brand: chalk.hex("#6366f1"),
  logo: chalk.hex("#6366f1").bold,

  // Success states
  success: chalk.green.bold,
  checkmark: chalk.green("✅"),

  // Info states
  info: chalk.cyan,
  scanning: chalk.cyan("🔍"),
  folder: chalk.blue("📁"),
  file: chalk.gray("📄"),

  // Warning states
  warning: chalk.yellow.bold,
  warningIcon: chalk.yellow("⚠️"),

  // Error states
  error: chalk.red.bold,
  errorIcon: chalk.red("❌"),

  // Stats and numbers
  number: chalk.magenta.bold,
  size: chalk.cyan,
  percentage: chalk.yellow,

  // Code and paths
  code: chalk.gray,
  path: chalk.dim,
  filename: chalk.white.bold,

  // Decorative
  separator: chalk.gray("━".repeat(20)),
  bullet: chalk.dim("•"),
  arrow: chalk.dim("→"),

  // Dropdown selection symbols
  symbols: {
    cursor: chalk.cyan("▶"),          // current cursor
    dot: chalk.yellow("•"),           // not selected
    dotSelected: chalk.green("●"),    // selected
  },

  // Progress
  progressFilled: chalk.green("▓"),
  progressEmpty: chalk.gray("░"),
};

// Helper functions for common UI patterns
export const ui = {
  header: (text) => colors.brand.bold(`\n🧠 ${text}\n`),
  success: (text) => `${colors.checkmark} ${colors.success(text)}`,
  info: (text) => `${colors.scanning} ${colors.info(text)}`,
  warning: (text) => `${colors.warningIcon} ${colors.warning(text)}`,
  error: (text) => `${colors.errorIcon} ${colors.error(text)}`,

  fileCount: (count) => `${colors.file} ${colors.number(count)} files`,
  fileSize: (size) => colors.size(`(${size})`),

  progress: (current, total, width = 20) => {
    const progress = current / total;
    const filled = Math.round(progress * width);
    const empty = width - filled;
    const percentage = Math.round(progress * 100);
    return `[${colors.progressFilled.repeat(filled)}${colors.progressEmpty.repeat(empty)}] ${colors.percentage(percentage + "%")}`;
  },

  separator: () => colors.separator,
  tip: (text) => colors.info(`💡 ${text}`),

  treeItem: (icon, name, isLast = false) => {
    const connector = isLast ? "└── " : "├── ";
    return `${colors.path(connector)}${icon} ${colors.filename(name)}`;
  },

  stat: (label, value, unit = "") => {
    return `${colors.path("  ")}${colors.code(label.padEnd(15))} ${colors.number(value)} ${colors.dim(unit)}`;
  },

  dropdownItem: (text, isHighlighted, isSelected) => {
    const symbol = isSelected ? colors.symbols.dotSelected : colors.symbols.dot;
    const cursor = isHighlighted ? colors.symbols.cursor : " ";
    const color = isSelected ? chalk.green.bold : chalk.yellow;
    return `${cursor} ${symbol} ${color(text)}`;
  },
};
