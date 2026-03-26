# Sean's MacBook Pro M3 Setup Guide
## SOLVY SCRUM Master Development Environment

**Last Updated:** March 25, 2025  
**For:** MacBook Pro M3 (Apple Silicon)  
**User:** Sean (SCRUM Master)

---

## 🎯 What We're Setting Up

Complete development environment for managing SOLVY project:
- ✅ VS Code (or VSCodium) with SCRUM extensions
- ✅ Docker Desktop for Gitea
- ✅ Git configuration
- ✅ Node.js/npm
- ✅ Python (for scripts)
- ✅ All SOLVY project tools

**Estimated Time:** 45-60 minutes

---

## Step 1: Homebrew (Package Manager)

Homebrew is the Mac package manager - installs almost everything else.

### Install Homebrew

Open Terminal (Cmd+Space, type "Terminal", press Enter)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**What you'll see:**
- Script will ask for your Mac password
- Shows installation progress
- Takes 2-5 minutes

### Verify Installation

```bash
brew --version
```

**Expected output:**
```
Homebrew 4.x.x
```

### Add Homebrew to PATH (if needed)

If `brew` command not found after install:

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

---

## Step 2: Install VS Code or VSCodium

### Option A: VS Code (Microsoft)

```bash
brew install --cask visual-studio-code
```

**Pros:** Full Microsoft extensions marketplace  
**Cons:** Microsoft telemetry

### Option B: VSCodium (Recommended for Privacy)

```bash
brew install --cask vscodium
```

**Pros:** Open source, no telemetry, same features  
**Cons:** Slightly different extension marketplace

> **Recommendation:** Use VSCodium for SOLVY (aligns with privacy principles)

### Open VS Code/VSCodium

```bash
# For VS Code:
code

# For VSCodium:
codium
```

Or press `Cmd+Space`, type "vscodium" or "visual studio code"

---

## Step 3: Install Essential CLI Tools

```bash
# Git (version control)
brew install git

# GitHub CLI (for PRs, issues)
brew install gh

# Node.js (JavaScript runtime)
brew install node

# Python 3
brew install python@3.12

# Tree (directory visualization)
brew install tree

# jq (JSON processor)
brew install jq

# wget
brew install wget

# curl (usually pre-installed, but ensure latest)
brew install curl

# htop (system monitor)
brew install htop

# fzf (fuzzy finder - super useful)
brew install fzf

# ripgrep (fast grep replacement)
brew install ripgrep

# fd (fast find replacement)
brew install fd

# bat (better cat with syntax highlighting)
brew install bat

# exa (better ls)
brew install exa
```

### Verify Installations

```bash
git --version
node --version
python3 --version
```

**Expected:**
```
git version 2.40+
v20.x.x
Python 3.12.x
```

---

## Step 4: Configure Git

```bash
# Set your name and email
git config --global user.name "Sean"
git config --global user.email "sean@ebl.beauty"

# Set default branch name
git config --global init.defaultBranch main

# Set VS Code/VSCodium as default editor
git config --global core.editor "codium --wait"
# OR for VS Code:
# git config --global core.editor "code --wait"

# Enable colorful output
git config --global color.ui auto

# Set default push behavior
git config --global push.default simple

# Store credentials (keychain)
git config --global credential.helper osxkeychain
```

### Create SSH Key for Gitea

```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "sean@ebl.beauty"

# Press Enter to accept default location
# Press Enter twice for no password (or set one)

# Start SSH agent
eval "$(ssh-agent -s)"

# Add key to agent
ssh-add ~/.ssh/id_ed25519

# Copy public key (you'll paste this into Gitea)
cat ~/.ssh/id_ed25519.pub
```

**Save this key** - you'll need it for Gitea setup tomorrow!

---

## Step 5: Install Docker Desktop

### Method 1: Homebrew (Recommended)

```bash
brew install --cask docker
```

### Method 2: Manual Download

1. Go to: https://www.docker.com/products/docker-desktop
2. Click "Download for Mac - Apple Silicon"
3. Open downloaded DMG
4. Drag Docker to Applications

### First Run

1. Open Docker Desktop from Applications
2. Accept license agreement
3. Wait for "Docker Desktop is running" (whale icon in menu bar)
4. Sign in or skip (Docker Hub account optional)

### Verify Docker

```bash
docker --version
docker-compose --version
```

**Expected:**
```
Docker version 24.x.x
Docker Compose version v2.x.x
```

### Configure Docker for M3

1. Open Docker Desktop
2. Click gear icon (Settings)
3. **Resources:**
   - CPUs: 4 (or more if available)
   - Memory: 8 GB (or more)
   - Swap: 2 GB
4. **General:**
   - ☑️ Start Docker Desktop when you log in
   - ☑️ Open Docker Dashboard when Docker starts
5. Click "Apply & Restart"

---

## Step 6: Install VS Code/VSCodium Extensions

### Open Extensions Panel

Press `Cmd+Shift+X` or click Extensions icon in sidebar

### Install SCRUM/Agile Extensions

Search and install each:

#### Essential for SCRUM Master

1. **Todo Tree** (`gruntfuggly.todo-tree`)
   - Shows all TODOs across project

2. **TODO Highlight** (`wayou.vscode-todo-highlight`)
   - Highlights TODO/FIXME/BUG in code

3. **Project Manager** (`alefragnani.project-manager`)
   - Switch between projects quickly

4. **GitLens** (`eamodio.gitlens`)
   - Enhanced Git visualization

5. **Git Graph** (`mhutchie.git-graph`)
   - Visual Git history

#### Development Essentials

6. **Markdown All in One** (`yzhang.markdown-all-in-one`)
   - Markdown editing

7. **Markdown Preview Mermaid** (`bierner.markdown-mermaid`)
   - Mermaid diagram support

8. **Code Spell Checker** (`streetsidesoftware.code-spell-checker`)
   - Catch typos

9. **Material Icon Theme** (`pkief.material-icon-theme`)
   - Nice file icons

10. **Prettier** (`esbenp.prettier-vscode`)
    - Code formatting

### Alternative: Install via Command Line

```bash
# For VSCodium:
codium --install-extension gruntfuggly.todo-tree
codium --install-extension wayou.vscode-todo-highlight
codium --install-extension alefragnani.project-manager
codium --install-extension eamodio.gitlens
codium --install-extension mhutchie.git-graph
codium --install-extension yzhang.markdown-all-in-one
codium --install-extension bierner.markdown-mermaid
codium --install-extension streetsidesoftware.code-spell-checker
codium --install-extension pkief.material-icon-theme
codium --install-extension esbenp.prettier-vscode

# For VS Code (replace codium with code):
# code --install-extension gruntfuggly.todo-tree
# ...etc
```

---

## Step 7: Configure VS Code/VSCodium Settings

### Open Settings

Press `Cmd+,` (Command + Comma)

Or: Code → Preferences → Settings

### Copy SOLVY Settings

The project includes pre-configured settings. Copy them:

```bash
# Navigate to project
cd /Users/smayone/Sovereignitity-Stack

# VS Code will automatically detect .vscode/settings.json
# Just open the folder in VS Code:
codium .
# OR: code .
```

### Manual Settings (if needed)

Add to `~/Library/Application Support/VSCodium/User/settings.json`:

```json
{
  "editor.fontSize": 14,
  "editor.fontFamily": "JetBrains Mono, Menlo, Monaco, monospace",
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.wordWrap": "on",
  "editor.minimap.enabled": false,
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "git.enableSmartCommit": true,
  "git.confirmSync": false,
  "terminal.integrated.shell.osx": "/bin/zsh",
  "workbench.iconTheme": "material-icon-theme"
}
```

---

## Step 8: Install Zsh Enhancements (Optional but Recommended)

### Oh My Zsh (Zsh framework)

```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

### Useful Plugins

```bash
# Auto-suggestions (shows command history as you type)
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions

# Syntax highlighting
brew install zsh-syntax-highlighting
```

### Configure .zshrc

```bash
# Open zsh config
nano ~/.zshrc
```

Add to plugins line:
```
plugins=(git zsh-autosuggestions)
```

Add to end of file:
```bash
# SOLVY aliases
alias solvy="cd /Users/smayone/Sovereignitity-Stack"
alias gitea-start="cd /Users/smayone/Sovereignitity-Stack/gitea-tunnel-setup && ./manage.sh start"
alias gitea-stop="cd /Users/smayone/Sovereignitity-Stack/gitea-tunnel-setup && ./manage.sh stop"
alias gitea-status="cd /Users/smayone/Sovereignitity-Stack/gitea-tunnel-setup && ./manage.sh status"

# Better ls
alias ls="exa"
alias ll="exa -la"
alias tree="exa --tree"

# Better cat
alias cat="bat"

# FZF setup
[ -f ~/.fzf.zsh ] && source ~/.fzf.zsh
```

Save: Ctrl+O, Enter, Ctrl+X

Reload:
```bash
source ~/.zshrc
```

---

## Step 9: Install Fonts (Optional)

### JetBrains Mono (Recommended for Coding)

```bash
brew tap homebrew/cask-fonts
brew install --cask font-jetbrains-mono
```

### Set in VS Code

1. Open Settings (`Cmd+,`)
2. Search "font family"
3. Set to: `JetBrains Mono, Menlo, Monaco, monospace`
4. ☑️ Enable "Font Ligatures" (if you like connected operators like `=>`)

---

## Step 10: Clone SOLVY Repository

### Create Projects Directory

```bash
mkdir -p ~/Projects
cd ~/Projects
```

### Clone (After Gitea is Set Up Tomorrow)

Today - just verify you can access the local project:

```bash
cd /Users/smayone/Sovereignitity-Stack
ls -la
```

You should see:
- `solvy-platform/`
- `gitea-tunnel-setup/`
- `tasks/`
- `sprints/`
- `SCRUM-BOARD.md`

### Open in VS Code

```bash
cd /Users/smayone/Sovereignitity-Stack
codium .
```

---

## Step 11: Verify Everything Works

### Run Verification Script

```bash
cd /Users/smayone/Sovereignitity-Stack

# Check all tools
echo "=== Verification ==="
echo "Homebrew: $(brew --version | head -1)"
echo "Git: $(git --version)"
echo "Node: $(node --version)"
echo "Python: $(python3 --version)"
echo "Docker: $(docker --version)"
echo "VS Code/VSCodium: $(codium --version 2>/dev/null | head -1 || code --version | head -1)"
echo "=== Done ==="
```

### Test Docker

```bash
docker run hello-world
```

Should see: "Hello from Docker!"

### Test Git

```bash
cd /Users/smayone/Sovereignitity-Stack
git status
git log --oneline -5
```

### Test VS Code Extensions

1. Open `SCRUM-BOARD.md`
2. Press `Cmd+Shift+P`
3. Type "Todo Tree: Focus on View"
4. Should see Todo Tree sidebar open

---

## 🎉 Setup Complete!

### What You Now Have

| Tool | Purpose | Status |
|------|---------|--------|
| Homebrew | Package manager | ✅ |
| VSCodium/VS Code | IDE | ✅ |
| Git | Version control | ✅ |
| Docker Desktop | Containers | ✅ |
| Node.js | JavaScript | ✅ |
| Python | Scripts | ✅ |
| Extensions | SCRUM/Agile tools | ✅ |
| Zsh config | Shell enhancements | ✅ |

### Quick Reference Card

```bash
# Daily commands
solvy                    # Go to project directory
gitea-start              # Start Gitea server
gitea-status             # Check Gitea status
gitea-stop               # Stop Gitea server

# Git commands
git status               # Check changes
git add .                # Stage all
git commit -m "msg"      # Commit
git push                 # Push to remote
git pull                 # Pull latest

# Docker commands
docker ps                # List running containers
docker-compose up -d     # Start services
docker-compose down      # Stop services

# Navigation
ll                       # List files (detailed)
tree                     # Show directory tree
cat file.md              # View file (with syntax highlighting)
```

---

## 📋 Tomorrow's Gitea Setup

After this setup is complete, tomorrow you'll:

1. **Run Gitea setup:**
   ```bash
   cd /Users/smayone/Sovereignitity-Stack/gitea-tunnel-setup
   ./complete-setup.sh
   ```

2. **Everything will work smoothly** because all prerequisites are installed!

---

## 🆘 Troubleshooting

### "Command not found" errors

```bash
# Add Homebrew to PATH
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### VS Code won't open from terminal

```bash
# For VSCodium:
ln -s /Applications/VSCodium.app/Contents/Resources/app/bin/codium /usr/local/bin/codium

# For VS Code:
ln -s /Applications/Visual\ Studio\ Code.app/Contents/Resources/app/bin/code /usr/local/bin/code
```

### Docker not starting

1. Open System Preferences → Security & Privacy
2. Check if Docker needs approval
3. Click "Allow"
4. Restart Docker Desktop

### Permission denied errors

```bash
# Fix Homebrew permissions
sudo chown -R $(whoami) /opt/homebrew
```

---

## 📞 Support

**Stuck on setup?**
1. Check specific error message in this guide
2. Search: https://stackoverflow.com
3. Ask: @sa-nathan

**Questions about tools?**
- Homebrew: https://docs.brew.sh
- Docker: https://docs.docker.com/desktop/mac/
- VS Code: https://code.visualstudio.com/docs

---

**Your MacBook is now ready for SOLVY SCRUM Master duties! 🚀**

*Next: Run Gitea setup tomorrow using `GITEA-SETUP-CHECKLIST.md`*
