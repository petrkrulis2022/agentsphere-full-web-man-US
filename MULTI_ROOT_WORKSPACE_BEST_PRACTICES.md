# 🎯 Multi-Root Workspace Guidelines

## 📁 Project Structure

```
agentsphere-development.code-workspace
├── AR Viewer (NeAR Viewer)/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
└── AgentSphere (Deployment)/
    ├── src/
    ├── package.json
    └── vite.config.js
```

## 🤖 Copilot Prompting Strategy

### Option 1: Context-Aware Prompting (Recommended)

Copilot automatically detects which project you're working in based on:

- Active file location
- Terminal working directory
- File path in prompt

**Best Practice:**

```javascript
// When working in AR Viewer files
"Update the NeAR Agents marketplace to show agent status";

// When working in AgentSphere files
"Add validation to the deployment form for token selection";

// Cross-project changes
"Update AR Viewer to display the new agent types from AgentSphere";
```

### Option 2: Explicit Project Specification

```javascript
// Be explicit when needed
"In the AR Viewer project, update the agent cards...";
"In the AgentSphere project, modify the deployment form...";
```

## 🖥️ Server Management

### Recommended Approach: Separate Terminals

**Terminal 1: AR Viewer**

```bash
# Navigate to AR Viewer
cd "AR Viewer (NeAR Viewer)"
npm run dev
# Runs on http://localhost:5174
```

**Terminal 2: AgentSphere**

```bash
# Navigate to AgentSphere
cd "AgentSphere (Deployment)"
npm run dev
# Runs on http://localhost:5173
```

### VS Code Terminal Management

```
Terminal Panel:
├── Terminal 1: AR Viewer Dev Server
├── Terminal 2: AgentSphere Dev Server
├── Terminal 3: Database/Git Commands
└── Terminal 4: General Commands
```

## 🔄 Development Workflow

### Daily Development Process:

**1. Start Both Servers**

```bash
# Terminal 1
cd "AR Viewer (NeAR Viewer)" && npm run dev

# Terminal 2
cd "AgentSphere (Deployment)" && npm run dev
```

**2. Development Flow**

1. Deploy agent in AgentSphere (localhost:5173)
2. View agent in AR Viewer marketplace (localhost:5174)
3. Test QR payments end-to-end
4. Iterate based on testing

**3. Code Changes**

- Work in appropriate project based on feature
- Copilot context automatically switches
- Test integration between both apps

## 🎯 Prompting Best Practices

### When to Prompt Each Project:

**AR Viewer Prompts:**

- Marketplace UI changes
- Agent card improvements
- QR scanning enhancements
- AR scene modifications

**AgentSphere Prompts:**

- Deployment form updates
- Database schema changes
- Payment token additions
- Agent type modifications

**Cross-Project Prompts:**

- Database integration issues
- Payment flow problems
- Data synchronization
- End-to-end testing

## 🛠️ Practical Examples

### Scenario 1: Add New Agent Type

```bash
# Step 1: Update AgentSphere
"Add 'Restaurant Agent' to the agent type dropdown and database enum"

# Step 2: Update AR Viewer
"Add 'Restaurant Agent' to the marketplace filter categories"
```

### Scenario 2: Fix Payment Issue

```bash
# Cross-project prompt (either terminal)
"The QR payment from AR Viewer to AgentSphere deployed agents is failing. Debug the wallet address flow between both applications."
```

## 📋 Quick Reference

### ✅ DO:

- Keep both servers running simultaneously
- Use separate terminals for each project
- Let Copilot auto-detect context from active files
- Test integration frequently
- Commit changes to appropriate repositories

### ❌ DON'T:

- Try to run both servers from same terminal
- Mix project-specific code in wrong directories
- Forget which project you're prompting about
- Make database changes without coordinating both apps

## 🚀 Optimal Workflow

### Most Efficient Approach:

1. Open workspace (`agentsphere-development.code-workspace`)
2. Start both servers in separate terminals
3. Work on features in appropriate project
4. Prompt Copilot based on active file context
5. Test integration regularly between both apps

**This approach gives you maximum flexibility while keeping both projects perfectly synchronized!** 🎯

---

## 🔧 Additional Tips

### Git Management

```bash
# Each project has separate git history
cd "AR Viewer (NeAR Viewer)" && git status
cd "AgentSphere (Deployment)" && git status
```

### Environment Variables

- Each project maintains separate `.env` files
- Coordinate database URLs and API keys
- Share environment variables when needed

### Testing Integration

```bash
# Test complete flow
1. Deploy agent in AgentSphere
2. Check database for new agent
3. Verify agent appears in AR Viewer
4. Test QR payment flow
5. Confirm payment reaches deployer wallet
```

### Debugging Cross-Project Issues

- Use browser dev tools for both apps
- Check console logs in both applications
- Verify database schema compatibility
- Test API endpoints between projects

**Happy multi-root development!** 🚀

## 🚨 Common Issues & Solutions

### Port Conflicts

```bash
# If ports 5173/5174 are taken:
# Check running processes
lsof -i :5173
lsof -i :5174

# Kill conflicting processes
kill -9 <PID>

# Use alternative ports in package.json
{
  "scripts": {
    "dev": "vite --port 3000"
  }
}
```

### Context Confusion

```bash
# If Copilot targets wrong project:
# 1. Explicitly mention project in prompt
"In the AR Viewer project, fix the marketplace loading issue"

# 2. Check active file location
# Make sure you're editing files in the correct project folder

# 3. Use workspace-relative paths
"Update ./src/components/AgentCard.jsx in AR Viewer"
```

### Database Connection Issues

```bash
# Check environment variables
cat .env | grep SUPABASE

# Test database connection
npm run db:test

# Verify schema alignment
npm run test:schema
```

## 🏃‍♂️ Performance Optimization

### Development Server Performance

```bash
# Enable network access
npm run dev -- --host 0.0.0.0

# Increase file watching limits (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Use faster builds with SWC
npm install @vitejs/plugin-react-swc
```

### Environment Management

```bash
# Use .env.local for development overrides
# .env.local (not committed to git)
VITE_API_URL=http://localhost:3001
VITE_DEBUG_MODE=true

# Keep shared config in .env
# .env (committed to git)
VITE_APP_NAME=AgentSphere
```

### Memory Optimization

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Clear node_modules cache
rm -rf node_modules package-lock.json
npm install
```

## ✅ End-to-End Testing Checklist

### Pre-Development Setup

- [ ] Multi-root workspace opened (`agentsphere-development.code-workspace`)
- [ ] Both servers running on correct ports (AR: 5174, AgentSphere: 5173)
- [ ] Database connection verified
- [ ] Environment variables configured

### Agent Deployment Flow

- [ ] AgentSphere deployment form accessible
- [ ] New agent types selectable (intelligent_assistant, local_services, etc.)
- [ ] Enhanced stablecoins available (USDT, USDC, USDs, etc.)
- [ ] Wallet connection successful
- [ ] Agent deployment completes without errors

### AR Viewer Integration

- [ ] Agent appears in AR Viewer marketplace
- [ ] Agent data displays correctly (name, type, location)
- [ ] Distance calculation works
- [ ] Filtering by agent type functional
- [ ] Real-time updates when new agents deployed

### Payment System Validation

- [ ] QR code generates successfully
- [ ] QR contains correct recipient address (deployer wallet)
- [ ] QR contains correct payment amount
- [ ] QR supports selected stablecoin
- [ ] Multi-network support verified (Morph, Ethereum, Polygon)

### Cross-Browser Compatibility

- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (if on macOS)
- [ ] Mobile browsers

### Performance Testing

- [ ] Page load times acceptable (<3s)
- [ ] Real-time updates responsive
- [ ] No memory leaks during extended use
- [ ] Smooth navigation between components

## ⚡ Workspace Automation & Shortcuts

### VS Code Tasks Configuration

Create `.vscode/tasks.json` in workspace root:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start AR Viewer",
      "type": "shell",
      "command": "npm run dev",
      "options": {
        "cwd": "${workspaceFolder:AR Viewer (NeAR Viewer)}"
      },
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "panel": "new"
      },
      "isBackground": true
    },
    {
      "label": "Start AgentSphere",
      "type": "shell",
      "command": "npm run dev",
      "options": {
        "cwd": "${workspaceFolder:AgentSphere (Deployment)}"
      },
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "panel": "new"
      },
      "isBackground": true
    },
    {
      "label": "Start Both Servers",
      "dependsOn": ["Start AR Viewer", "Start AgentSphere"],
      "group": "build"
    }
  ]
}
```

### Launch Configuration

Create `.vscode/launch.json` for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug AR Viewer",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder:AR Viewer (NeAR Viewer)}/node_modules/.bin/vite",
      "args": ["--mode", "development"],
      "console": "integratedTerminal"
    },
    {
      "name": "Debug AgentSphere",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder:AgentSphere (Deployment)}/node_modules/.bin/vite",
      "args": ["--mode", "development"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Useful Keyboard Shortcuts

```bash
# Quick project switching
Ctrl+Shift+P → "Terminal: Create New Terminal"
Select project folder from dropdown

# File navigation
Ctrl+P → Type filename (auto-detects correct project)
Ctrl+Shift+P → "File: Open Folder" → Select specific project

# Git operations per project
Ctrl+Shift+G → Select repository from dropdown
```

### Shell Aliases for Efficiency

Add to your `.bashrc` or `.zshrc`:

```bash
# Quick navigation
alias ar-viewer='cd "AR Viewer (NeAR Viewer)"'
alias agentsphere='cd "AgentSphere (Deployment)"'
alias workspace='code agentsphere-development.code-workspace'

# Development shortcuts
alias start-ar='cd "AR Viewer (NeAR Viewer)" && npm run dev'
alias start-sphere='cd "AgentSphere (Deployment)" && npm run dev'
alias start-both='start-ar & start-sphere'

# Testing shortcuts
alias test-integration='npm run test:integration'
alias test-schema='npm run test:schema'
```

## 🎯 Pro Tips for Maximum Efficiency

### 1. Terminal Organization Strategy

```bash
# Name your terminals for clarity
Terminal 1: "🔵 AR Viewer Dev"
Terminal 2: "🟠 AgentSphere Dev"
Terminal 3: "⚫ Database/Git"
Terminal 4: "⚪ General Commands"
```

### 2. File Watcher Optimization

```bash
# Add to each project's vite.config.js
export default {
  server: {
    watch: {
      usePolling: true,
      interval: 1000
    }
  }
}
```

### 3. Dependency Management

```bash
# Keep dependencies in sync
npm outdated  # Check for updates in both projects
npm audit     # Security check both projects
npm dedupe    # Remove duplicate dependencies
```

### 4. Debugging Cross-Project Issues

```javascript
// Add debug flags to localStorage
localStorage.setItem("DEBUG_AR_VIEWER", "true");
localStorage.setItem("DEBUG_AGENTSPHERE", "true");

// Use consistent logging format
console.log("[AR-VIEWER]", "Marketplace loaded:", agents.length);
console.log("[AGENTSPHERE]", "Agent deployed:", agentData);
```
