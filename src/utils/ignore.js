import fs from "fs";
import path from "path";
import { getIgnorePatterns } from "../commands/ignore.js";

const defaultIgnore = ["node_modules", ".git", "dist", "build"];
const ignoreFiles = ["package-lock.json", "yarn.lock"];

export function shouldIgnore(fullPath, fileName, rootDir) {
  // Get custom ignore patterns from .cortxtignore file
  const customPatterns = getCustomIgnorePatterns();
  
  // Check against custom patterns first
  for (const pattern of customPatterns) {
    if (matchesPattern(fullPath, fileName, pattern, rootDir)) {
      return true;
    }
  }
  
  // Fallback to default ignore logic
  return (
    defaultIgnore.some(rule => fullPath.includes(rule)) ||
    ignoreFiles.includes(fileName)
  );
}

function getCustomIgnorePatterns() {
  try {
    return getIgnorePatterns();
  } catch (error) {
    // If we can't get custom patterns, use defaults
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
}

function matchesPattern(fullPath, fileName, pattern, rootDir) {
  // Convert Windows paths to Unix-style for consistent pattern matching
  const normalizedFullPath = fullPath.replace(/\\/g, '/');
  const relativePath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
  
  // Handle different pattern types
  if (pattern.includes('*')) {
    // Glob pattern matching
    return matchesGlobPattern(fileName, pattern) || 
           matchesGlobPattern(relativePath, pattern) ||
           matchesGlobPattern(normalizedFullPath, pattern);
  } else {
    // Simple string matching
    return fileName === pattern || 
           relativePath.includes(pattern) || 
           normalizedFullPath.includes(pattern);
  }
}

function matchesGlobPattern(str, pattern) {
  // Simple glob pattern matching
  // Convert glob pattern to regex
  const regex = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape special regex chars
    .replace(/\*/g, '.*') // Convert * to .*
    .replace(/\?/g, '.'); // Convert ? to .
  
  return new RegExp(`^${regex}$`).test(str);
}

// Additional utility functions for ignore management

/**
 * Check if a file should be ignored based on its extension
 */
export function shouldIgnoreByExtension(fileName) {
  const ignoredExtensions = [
    '.log', '.tmp', '.temp', '.cache', '.bak', '.swp', '.swo',
    '.DS_Store', 'Thumbs.db', '.lock'
  ];
  
  const ext = path.extname(fileName).toLowerCase();
  const baseName = path.basename(fileName);
  
  return ignoredExtensions.includes(ext) || 
         ignoredExtensions.includes(baseName);
}

/**
 * Check if a directory should be ignored
 */
export function shouldIgnoreDirectory(dirName) {
  const ignoredDirs = [
    'node_modules', '.git', '.svn', '.hg', '.bzr',
    'dist', 'build', 'out', 'target',
    '.cache', '.temp', '.tmp', 
    'coverage', '.nyc_output',
    '__pycache__', '.pytest_cache',
    '.vscode', '.idea', '.vs'
  ];
  
  return ignoredDirs.includes(dirName);
}

/**
 * Get all ignore patterns including defaults and custom ones
 */
export function getAllIgnorePatterns() {
  const customPatterns = getCustomIgnorePatterns();
  const defaultPatterns = [
    ...defaultIgnore,
    ...ignoreFiles
  ];
  
  // Combine and deduplicate
  const allPatterns = [...new Set([...defaultPatterns, ...customPatterns])];
  
  return allPatterns;
}

/**
 * Check if a pattern is valid
 */
export function isValidPattern(pattern) {
  if (!pattern || typeof pattern !== 'string') {
    return false;
  }
  
  // Check for invalid characters or patterns
  const invalidChars = ['<', '>', ':', '"', '|', '\0'];
  if (invalidChars.some(char => pattern.includes(char))) {
    return false;
  }
  
  // Pattern should not be empty after trimming
  if (pattern.trim().length === 0) {
    return false;
  }
  
  return true;
}

/**
 * Normalize pattern for consistent matching
 */
export function normalizePattern(pattern) {
  return pattern
    .trim()
    .replace(/\\/g, '/') // Convert Windows paths to Unix-style
    .replace(/\/+/g, '/') // Remove multiple slashes
    .replace(/^\//, '') // Remove leading slash
    .replace(/\/$/, ''); // Remove trailing slash
}

/**
 * Check if pattern matches any common ignore patterns
 */
export function isCommonIgnorePattern(pattern) {
  const commonPatterns = [
    'node_modules', '.git', 'dist', 'build', '.cache',
    '*.log', '*.tmp', '*.temp', '.DS_Store', 'Thumbs.db',
    'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'
  ];
  
  return commonPatterns.includes(pattern);
}

/**
 * Get suggested patterns based on project type
 */
export function getSuggestedPatterns(projectType) {
  const suggestions = {
    'Node.js': ['node_modules', '*.log', 'dist', 'build', '.env*'],
    'React': ['node_modules', 'build', 'dist', '.env*', 'coverage'],
    'Next.js': ['node_modules', '.next', 'out', '.env*', 'coverage'],
    'Vue.js': ['node_modules', 'dist', '.env*', 'coverage'],
    'Python': ['__pycache__', '*.pyc', '*.pyo', '.pytest_cache', 'venv', '.env'],
    'Rust': ['target', 'Cargo.lock', '*.orig'],
    'Go': ['vendor', '*.exe', '*.test', '*.out'],
    'PHP': ['vendor', '*.log', 'composer.lock'],
    'Java': ['target', '*.class', '*.jar', '*.war'],
    'C++': ['*.o', '*.obj', '*.exe', '*.dll', 'build']
  };
  
  return suggestions[projectType] || suggestions['Node.js'];
}