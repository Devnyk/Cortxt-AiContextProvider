# Cortex 🧠

AI-friendly CLI to share project context or file code easily.

## Installation

```bash
npm install cortex
```

## Quick Start

```bash
# Extract entire project context
npx cortex context

# Extract a specific file  
npx cortex file src/index.js

# Extract only dependencies
npx cortex deps
```

## Commands

### `npx cortex context`
Extracts all project files and formats them for AI consumption.

```bash
npx cortex context
npx cortex context --verbose
npx cortex context --stats
```

### `npx cortex file <filepath>`
Extracts a single file with proper formatting.

```bash
npx cortex file src/app.js
npx cortex file README.md --lines
```

### `npx cortex deps`
Extracts only the dependencies from package.json.

```bash
npx cortex deps
npx cortex deps --dev-only
npx cortex deps --prod-only
```

### `npx cortex tree`
Shows project file structure.

```bash
npx cortex tree
npx cortex tree --depth 5
```

### `npx cortex stats`
Displays project statistics.

```bash
npx cortex stats
```

## What It Does

**Cortex** automatically:
- Scans your project files
- Ignores `node_modules`, `.git`, binary files
- Formats everything with proper markdown
- Copies to clipboard automatically
- Perfect for sharing code with AI assistants

## Example Output

````markdown
### src/index.js
```javascript
function hello() {
  console.log("Hello World!");
}
```

### package.json
```json
{
  "name": "my-project",
  "version": "1.0.0"
}
```
````

## Options

- `--verbose` - Show detailed scanning info
- `--stats` - Display project statistics  
- `--lines` - Include line numbers
- `--dev-only` - Only devDependencies
- `--prod-only` - Only production dependencies
- `--depth <n>` - Tree depth (default: 3)

## Use Cases

**With AI Assistants:**
```bash
npx cortex context  # Get full project
# Paste into ChatGPT/Claude for help
```

**Specific Files:**
```bash
npx cortex file src/components/Header.jsx
npx cortex deps
```

## Features

- 🧠 AI-optimized formatting
- 📦 Automatic clipboard copying
- Smart file filtering
- Works with any project type
- No global installation needed

## Requirements

- Node.js 14+ 
- npm

## Upcoming Features

- Enhanced terminal colors with `chalk` package
- Better progress indicators
- Custom ignore patterns

---

**Cortex 🧠** - Your AI coding companion.