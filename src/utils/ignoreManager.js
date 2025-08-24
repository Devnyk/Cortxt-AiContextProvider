import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { colors } from './colors.js';

const CORTXT_IGNORE_FILE = '.cortxtignore';

export class IgnoreManager {
  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir;
    this.ignoreFilePath = path.join(rootDir, CORTXT_IGNORE_FILE);
    this.customIgnores = this.loadCustomIgnores();
  }

  loadCustomIgnores() {
    try {
      if (fs.existsSync(this.ignoreFilePath)) {
        const content = fs.readFileSync(this.ignoreFilePath, 'utf-8');
        return content
          .split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.startsWith('#'));
      }
    } catch (err) {
      console.warn(`${colors.warning('Warning:')} Could not load .cortxtignore file`);
    }
    return [];
  }

  saveCustomIgnores() {
    try {
      const content = [
        '# Cortxt ignore file',
        '# Add files and folders you want to exclude',
        '# Use patterns like:', 
        '# *.log',
        '# temp/',
        '# specific-file.txt',
        '',
        ...this.customIgnores
      ].join('\n');
      
      fs.writeFileSync(this.ignoreFilePath, content);
      console.log(`${colors.success('✅ Ignore rules saved to')} ${colors.filename('.cortxtignore')}`);
    } catch (err) {
      console.error(`${colors.error('Error saving ignore file:')} ${err.message}`);
    }
  }

  async manageIgnoreRules() {
    const choices = [
      { name: '➕ Add ignore pattern', value: 'add' },
      { name: '📝 View current rules', value: 'view' },
      { name: '❌ Remove ignore pattern', value: 'remove' },
      { name: '🔄 Reset to default', value: 'reset' },
      { name: '← Back', value: 'back' }
    ];

    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'Manage ignore rules:',
      choices
    }]);

    switch (action) {
      case 'add':
        await this.addIgnorePattern();
        break;
      case 'view':
        this.viewIgnoreRules();
        break;
      case 'remove':
        await this.removeIgnorePattern();
        break;
      case 'reset':
        await this.resetIgnoreRules();
        break;
      case 'back':
        return;
    }

    // Show menu again unless user chose back
    if (action !== 'back') {
      await this.manageIgnoreRules();
    }
  }

  async addIgnorePattern() {
    const { pattern } = await inquirer.prompt([{
      type: 'input',
      name: 'pattern',
      message: 'Enter ignore pattern (e.g., *.log, temp/, specific-file.txt):',
      validate: (input) => {
        if (!input.trim()) return 'Please enter a pattern';
        return true;
      }
    }]);

    const trimmedPattern = pattern.trim();
    if (!this.customIgnores.includes(trimmedPattern)) {
      this.customIgnores.push(trimmedPattern);
      this.saveCustomIgnores();
      console.log(`${colors.success('✅ Added ignore pattern:')} ${colors.filename(trimmedPattern)}`);
    } else {
      console.log(`${colors.warning('Pattern already exists:')} ${colors.filename(trimmedPattern)}`);
    }
  }

  viewIgnoreRules() {
    console.log(`\n${colors.brand.bold('📋 Current Ignore Rules:')}`);
    
    if (this.customIgnores.length === 0) {
      console.log(`${colors.dim('  No custom ignore rules defined')}`);
      console.log(`${colors.info('  Using default ignores: node_modules, .git, dist, build')}`);
    } else {
      this.customIgnores.forEach((pattern, index) => {
        console.log(`  ${colors.number((index + 1).toString().padStart(2))}. ${colors.filename(pattern)}`);
      });
    }
    console.log('');
  }

  async removeIgnorePattern() {
    if (this.customIgnores.length === 0) {
      console.log(`${colors.warning('No custom ignore patterns to remove')}`);
      return;
    }

    const choices = this.customIgnores.map(pattern => ({
      name: pattern,
      value: pattern
    }));

    const { pattern } = await inquirer.prompt([{
      type: 'list',
      name: 'pattern',
      message: 'Select pattern to remove:',
      choices
    }]);

    this.customIgnores = this.customIgnores.filter(p => p !== pattern);
    this.saveCustomIgnores();
    console.log(`${colors.success('✅ Removed ignore pattern:')} ${colors.filename(pattern)}`);
  }

  async resetIgnoreRules() {
    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: 'Reset all custom ignore rules?',
      default: false
    }]);

    if (confirm) {
      this.customIgnores = [];
      if (fs.existsSync(this.ignoreFilePath)) {
        fs.unlinkSync(this.ignoreFilePath);
      }
      console.log(`${colors.success('✅ Reset ignore rules to default')}`);
    }
  }

  shouldIgnoreCustom(filePath) {
    return this.customIgnores.some(pattern => {
      // Simple pattern matching
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(path.basename(filePath)) || regex.test(filePath);
      }
      
      // Exact match or directory match
      return filePath.includes(pattern) || path.basename(filePath) === pattern;
    });
  }
}

// Create global instance
let ignoreManager;

export function getIgnoreManager(rootDir) {
  if (!ignoreManager) {
    ignoreManager = new IgnoreManager(rootDir);
  }
  return ignoreManager;
}