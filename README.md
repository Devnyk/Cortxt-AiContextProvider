# Cortxt 🧠

![Cortxt Banner](./assets/cortxt.png)

**The fastest way to provide project context to AI intelligence.**

AI-friendly CLI that instantly transforms your codebase into perfectly formatted context for ChatGPT, Claude, and any AI assistant.

## ⚡ Quick Start

```bash
# Get your entire project ready for AI in seconds
npx cortxt context

# Focus on a specific file  
npx cortxt file src/index.js

# Extract just the dependencies
npx cortxt deps
```

## 🚀 Installation

```bash
npm install cortxt
```

## 🎯 Commands

### `npx cortxt context`
**📁 Extract full project** - All files & code, AI-optimized formatting

```bash
npx cortxt context              # Complete project context
npx cortxt context --verbose    # Show detailed scanning info
npx cortxt context --stats      # Display project statistics
```

### `npx cortxt file <filepath>`
**📄 Extract single file** - Perfect for focused AI assistance

```bash
npx cortxt file src/app.js      # Single file extraction
npx cortxt file README.md --lines  # Include line numbers
```

### `npx cortxt deps`
**📦 Extract dependencies** - Package info for AI analysis

```bash
npx cortxt deps                 # All dependencies
npx cortxt deps --dev-only      # Development dependencies only
npx cortxt deps --prod-only     # Production dependencies only
```

### `npx cortxt tree`
**🌲 Project structure** - Visual folder hierarchy

```bash
npx cortxt tree                 # Show project structure
npx cortxt tree --depth 5       # Custom depth level
```

### `npx cortxt stats`
**📊 Project statistics** - Complete project analysis

```bash
npx cortxt stats               # Files, lines, size breakdown
```

## ✨ What Makes Cortxt Special

**Cortxt** is the **ultimate AI context provider** that:

- 🧠 **AI-optimized formatting** - Perfect markdown structure every time
- 📋 **Instant clipboard copying** - Zero friction workflow
- 🎯 **Smart file filtering** - Ignores `node_modules`, `.git`, binaries automatically  
- 🚀 **Lightning fast scanning** - Process entire projects in seconds
- 💡 **Intelligent suggestions** - Context-aware help based on your project
- 🔍 **Project type detection** - Recognizes React, Next.js, Vue, Node.js, Python, Rust, Go
- ⚡ **Zero configuration** - Works instantly with any project type

## 📋 Perfect AI-Ready Output

Cortxt formats your code exactly how AI assistants expect it:

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

## 🎨 Advanced Options

- `--verbose` - Detailed scanning information
- `--stats` - Complete project statistics  
- `--lines` - Include line numbers for debugging
- `--dev-only` - Development dependencies only
- `--prod-only` - Production dependencies only  
- `--depth <n>` - Tree display depth (default: 3)

## 🔥 Power User Workflows

### **AI Code Review Workflow**
```bash
npx cortxt context
# → Paste into ChatGPT/Claude
# → "Please review this codebase for best practices"
```

### **Debugging Specific Issues**
```bash
npx cortxt file src/components/Header.jsx
# → Paste into AI with error message
# → Get instant solutions
```

### **Architecture Planning**  
```bash
npx cortxt tree && npx cortxt deps
# → Share project structure + dependencies
# → Get architectural recommendations
```

### **Code Documentation**
```bash
npx cortxt context --stats
# → AI generates comprehensive project documentation
```

## 🏆 Why Developers Love Cortxt

> **"Saves me hours every week. Copy, paste, get instant AI help!"** - React Developer

> **"Finally, an AI context tool that just works. No setup, no config."** - Full-stack Engineer  

> **"Game changer for code reviews and debugging sessions."** - Tech Lead

## 🌟 Key Features

- **🧠 AI-first design** - Built specifically for AI interactions
- **⚡ Instant results** - No waiting, no loading screens
- **🎯 Smart filtering** - Only includes relevant files
- **🎨 Enhanced terminal colors** - Beautiful, modern CLI experience
- **📱 Universal compatibility** - Works with any project, any AI
- **🔒 Privacy focused** - Everything runs locally
- **📦 Zero dependencies** - Lightweight and fast

## 💻 System Requirements

- **Node.js 14+** - Modern JavaScript runtime
- **npm** - Package manager

## 🚧 Coming Soon

- **📊 Advanced analytics** - Deeper project insights  
- **⚙️ Custom ignore patterns** - Fine-tune what gets included
- **🔌 IDE integrations** - VS Code, WebStorm support
- **☁️ Cloud sync** - Share contexts across devices

## 🤝 Perfect For

- **AI-assisted development** - ChatGPT, Claude, GitHub Copilot
- **Code reviews** - Share context with team members
- **Documentation** - Generate docs from your codebase  
- **Debugging** - Get AI help with complex issues
- **Learning** - Understand new codebases quickly

---

**Cortxt 🧠** - *Your AI coding companion. Context made simple.*

**Ready to 10x your AI-assisted development?** → `npx cortxt context`