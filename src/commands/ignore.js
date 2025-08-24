import fs from "fs";
import path from "path";
import { colors } from "../utils/colors.js";
import { copyToClipboard } from "../utils/clipboard.js";

const CORTXT_IGNORE_FILE = ".cortxtignore";

export async function runIgnore(options = {}) {
  try {
    const ignorePath = path.join(process.cwd(), CORTXT_IGNORE_FILE);

    if (options.add) {
      await addIgnorePattern(ignorePath, options.add);
    } else if (options.remove) {
      await removeIgnorePattern(ignorePath, options.remove);
    } else if (options.list) {
      await listIgnorePatterns(ignorePath);
    } else if (options.reset) {
      await resetIgnorePatterns(ignorePath);
    } else {
      // Show current ignore patterns by default
      await listIgnorePatterns(ignorePath);
    }
  } catch (error) {
    console.error(`${colors.errorIcon} ${colors.error('Error:')} ${error.message}`);
    process.exit(1);
  }
}

export async function addIgnorePattern(ignorePath, pattern) {
  try {
    let patterns = [];
    
    // Read existing patterns
    if (fs.existsSync(ignorePath)) {
      const content = fs.readFileSync(ignorePath, 'utf-8');
      patterns = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    } else {
      // Create with default patterns if file doesn't exist
      patterns = getDefaultIgnorePatterns();
    }

    // Check if pattern already exists
    if (patterns.includes(pattern)) {
      console.log(`${colors.warningIcon} ${colors.warning(`Pattern "${pattern}" already exists in ignore list`)}`);
      return;
    }

    // Add new pattern
    patterns.push(pattern);
    
    // Write back to file
    const content = createIgnoreFileContent(patterns);
    fs.writeFileSync(ignorePath, content, 'utf-8');
    
    console.log(`${colors.success(`✅ Added "${pattern}" to ignore list`)}`);
    console.log(`${colors.info('📁 Pattern will be ignored in future cortxt commands')}`);
    
  } catch (error) {
    throw new Error(`Failed to add ignore pattern: ${error.message}`);
  }
}

export async function removeIgnorePattern(ignorePath, pattern) {
  try {
    if (!fs.existsSync(ignorePath)) {
      console.log(`${colors.warningIcon} ${colors.warning('No .cortxtignore file found')}`);
      return;
    }

    const content = fs.readFileSync(ignorePath, 'utf-8');
    let patterns = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    
    const originalLength = patterns.length;
    patterns = patterns.filter(p => p !== pattern);
    
    if (patterns.length === originalLength) {
      console.log(`${colors.warningIcon} ${colors.warning(`Pattern "${pattern}" not found in ignore list`)}`);
      return;
    }

    // Write back to file
    const newContent = createIgnoreFileContent(patterns);
    fs.writeFileSync(ignorePath, newContent, 'utf-8');
    
    console.log(`${colors.success(`✅ Removed "${pattern}" from ignore list`)}`);
    
  } catch (error) {
    throw new Error(`Failed to remove ignore pattern: ${error.message}`);
  }
}

async function listIgnorePatterns(ignorePath) {
  try {
    let patterns = [];
    
    if (fs.existsSync(ignorePath)) {
      const content = fs.readFileSync(ignorePath, 'utf-8');
      patterns = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    } else {
      patterns = getDefaultIgnorePatterns();
      console.log(`${colors.info('📄 Using default ignore patterns (no .cortxtignore file found)')}`);
    }

    console.log(`${colors.brand.bold('🚫 Current Ignore Patterns:')}`);
    console.log(colors.path('━'.repeat(30)));
    
    if (patterns.length === 0) {
      console.log(`${colors.warning('No ignore patterns configured')}`);
    } else {
      patterns.forEach((pattern, index) => {
        console.log(`  ${colors.number((index + 1).toString().padStart(2))}. ${colors.filename(pattern)}`);
      });
    }
    
    console.log(`\n${colors.info('💡 Commands:')}`);
    console.log(`  ${colors.brand('cortxt ignore --add "*.log"')}     # Add ignore pattern`);
    console.log(`  ${colors.brand('cortxt ignore --remove "*.log"')}  # Remove ignore pattern`);
    console.log(`  ${colors.brand('cortxt ignore --reset')}           # Reset to defaults`);
    
    // Copy patterns to clipboard
    const output = patterns.join('\n');
    copyToClipboard(`Current Cortxt Ignore Patterns:\n${patterns.map((p, i) => `${i + 1}. ${p}`).join('\n')}`);
    console.log(`\n${colors.success('✅ Ignore patterns copied to clipboard!')}`);
    
  } catch (error) {
    throw new Error(`Failed to list ignore patterns: ${error.message}`);
  }
}

async function resetIgnorePatterns(ignorePath) {
  try {
    const defaultPatterns = getDefaultIgnorePatterns();
    const content = createIgnoreFileContent(defaultPatterns);
    
    fs.writeFileSync(ignorePath, content, 'utf-8');
    
    console.log(`${colors.success('✅ Reset ignore patterns to default')}`);
    console.log(`${colors.info('📁 Default patterns restored:')}`);
    
    defaultPatterns.forEach((pattern, index) => {
      console.log(`  ${colors.number((index + 1).toString().padStart(2))}. ${colors.filename(pattern)}`);
    });
    
  } catch (error) {
    throw new Error(`Failed to reset ignore patterns: ${error.message}`);
  }
}

function getDefaultIgnorePatterns() {
  return [
    "node_modules",
    ".git",
    "dist",
    "build",
    ".cache",
    "coverage",
    ".nyc_output",
    "*.log",
    ".DS_Store",
    "Thumbs.db",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    ".env*",
    "*.tmp",
    "*.temp"
  ];
}

function createIgnoreFileContent(patterns) {
  const header = `# Cortxt Ignore Patterns
# This file specifies which files and directories to ignore when using cortxt commands
# Each line should contain one pattern (supports glob patterns)
# Lines starting with # are comments

`;
  
  return header + patterns.join('\n') + '\n';
}

export function getIgnorePatterns() {
  const ignorePath = path.join(process.cwd(), CORTXT_IGNORE_FILE);
  
  if (fs.existsSync(ignorePath)) {
    try {
      const content = fs.readFileSync(ignorePath, 'utf-8');
      return content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    } catch (error) {
      console.warn(`Warning: Could not read .cortxtignore file: ${error.message}`);
    }
  }
  
  return getDefaultIgnorePatterns();
}
