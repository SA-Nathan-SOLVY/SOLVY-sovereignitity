# Sean's MacBook Setup Checklist
## Follow This Step-by-Step

**Date:** _______________  
**MacBook:** MacBook Pro M3  
**Goal:** Complete development environment for SOLVY SCRUM Master

---

## Pre-Setup

- [ ] MacBook is plugged in (setup takes time)
- [ ] Connected to WiFi
- [ ] About 60 minutes of uninterrupted time
- [ ] Terminal.app can be found (Cmd+Space, type "Terminal")

---

## Phase 1: Homebrew (5 min)

- [ ] Open Terminal
- [ ] Paste and run:
  ```bash
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  ```
- [ ] Enter Mac password when prompted
- [ ] Wait for installation to complete
- [ ] Verify: run `brew --version`
- [ ] **Expected:** "Homebrew 4.x.x"

**If brew command not found after install:**
- [ ] Run: `echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile`
- [ ] Run: `eval "$(/opt/homebrew/bin/brew shellenv)"`
- [ ] Try `brew --version` again

---

## Phase 2: VS Code/VSCodium (5 min)

**Choose ONE:**

### Option A: VSCodium (Recommended)
- [ ] Run: `brew install --cask vscodium`
- [ ] Wait for installation
- [ ] Verify: press Cmd+Space, type "vscodium", should see icon

### Option B: VS Code
- [ ] Run: `brew install --cask visual-studio-code`
- [ ] Wait for installation
- [ ] Verify: press Cmd+Space, type "visual studio code"

---

## Phase 3: Essential Tools (10 min)

Copy and paste this entire block:

```bash
brew install git
brew install gh
brew install node
brew install python@3.12
brew install tree
brew install jq
brew install wget
brew install curl
brew install htop
brew install fzf
brew install ripgrep
brew install fd
brew install bat
brew install exa
```

- [ ] Paste in Terminal
- [ ] Press Enter
- [ ] Wait for all installations (5-10 minutes)

**Verify installations:**
- [ ] Run: `git --version` → should show "git version 2.x.x"
- [ ] Run: `node --version` → should show "v20.x.x"
- [ ] Run: `python3 --version` → should show "Python 3.12.x"

---

## Phase 4: Configure Git (5 min)

Copy and paste these commands one by one:

- [ ] `git config --global user.name "Sean"`
- [ ] `git config --global user.email "sean@ebl.beauty"`
- [ ] `git config --global init.defaultBranch main`
- [ ] For VSCodium: `git config --global core.editor "codium --wait"`
  - OR for VS Code: `git config --global core.editor "code --wait"`

### Create SSH Key (Important for Gitea!)

- [ ] Run: `ssh-keygen -t ed25519 -C "sean@ebl.beauty"`
- [ ] Press Enter 3 times (accept defaults, no password)
- [ ] Run: `eval "$(ssh-agent -s)"`
- [ ] Run: `ssh-add ~/.ssh/id_ed25519`
- [ ] Run: `cat ~/.ssh/id_ed25519.pub`
- [ ] **Copy the output** (you'll need this for Gitea tomorrow!)
- [ ] Save it in Notes app temporarily

---

## Phase 5: Docker Desktop (10 min)

- [ ] Run: `brew install --cask docker`
- [ ] Wait for download and install
- [ ] Open Docker Desktop from Applications folder
- [ ] Accept license agreement
- [ ] Wait for "Docker Desktop is running" (whale icon appears)
- [ ] Close signup window (optional account)

**Verify Docker:**
- [ ] Go back to Terminal
- [ ] Run: `docker --version`
- [ ] **Expected:** "Docker version 24.x.x"
- [ ] Run: `docker run hello-world`
- [ ] **Expected:** "Hello from Docker!" message

**Configure Docker:**
- [ ] Click Docker whale icon in menu bar
- [ ] Click gear icon (Settings)
- [ ] Go to Resources:
  - [ ] Set CPUs: 4
  - [ ] Set Memory: 8 GB
  - [ ] Set Swap: 2 GB
- [ ] Click "Apply & Restart"
- [ ] Wait for restart

---

## Phase 6: VS Code Extensions (10 min)

- [ ] Open VS Code/VSCodium (Cmd+Space, type "vscodium" or "code")
- [ ] Press `Cmd+Shift+X` (opens Extensions)

**Search and install each:**

- [ ] `gruntfuggly.todo-tree` - Todo Tree
- [ ] `wayou.vscode-todo-highlight` - TODO Highlight
- [ ] `alefragnani.project-manager` - Project Manager
- [ ] `eamodio.gitlens` - GitLens
- [ ] `mhutchie.git-graph` - Git Graph
- [ ] `yzhang.markdown-all-in-one` - Markdown
- [ ] `bierner.markdown-mermaid` - Mermaid diagrams
- [ ] `streetsidesoftware.code-spell-checker` - Spell check
- [ ] `pkief.material-icon-theme` - Icons
- [ ] `esbenp.prettier-vscode` - Prettier

**Alternative: Command Line Install (Faster)**

- [ ] Open Terminal
- [ ] For VSCodium, run:
  ```bash
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
  ```

---

## Phase 7: Open SOLVY Project (5 min)

- [ ] In Terminal, run:
  ```bash
  cd /Users/smayone/Sovereignitity-Stack
  codium .
  ```
  (or `code .` if using VS Code)

- [ ] VS Code should open with project
- [ ] Look at left sidebar - you should see file tree
- [ ] Click on `SCRUM-BOARD.md` to open it
- [ ] Check that Todo Tree icon appears in sidebar

---

## Phase 8: Optional Zsh Enhancements (5 min)

- [ ] Run: `sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"`
- [ ] When asked "Do you want to switch your default shell to zsh?" - type `Y`
- [ ] Wait for installation

**Add useful aliases:**
- [ ] Run: `nano ~/.zshrc`
- [ ] Scroll to bottom using arrow keys
- [ ] Paste this:
  ```bash
  # SOLVY shortcuts
  alias solvy="cd /Users/smayone/Sovereignitity-Stack"
  alias gitea-start="cd /Users/smayone/Sovereignitity-Stack/gitea-tunnel-setup && ./manage.sh start"
  alias gitea-stop="cd /Users/smayone/Sovereignitity-Stack/gitea-tunnel-setup && ./manage.sh stop"
  alias gitea-status="cd /Users/smayone/Sovereignitity-Stack/gitea-tunnel-setup && ./manage.sh status"
  ```
- [ ] Press `Ctrl+O` then Enter to save
- [ ] Press `Ctrl+X` to exit
- [ ] Run: `source ~/.zshrc`
- [ ] Test: type `solvy` and press Enter - should take you to project directory

---

## Phase 9: Verification (5 min)

**Run this verification script:**

```bash
echo "=== SOLVY Environment Verification ==="
echo ""
echo "Homebrew: $(brew --version | head -1)"
echo "Git: $(git --version)"
echo "Node: $(node --version)"
echo "Python: $(python3 --version)"
echo "Docker: $(docker --version)"
echo ""
echo "VS Code/VSCodium:"
codium --version 2>/dev/null | head -1 || code --version | head -1
echo ""
echo "=== Checking SOLVY Project ==="
cd /Users/smayone/Sovereignitity-Stack
ls -la | head -10
echo ""
echo "=== Done! ==="
```

**Expected output should show versions for all tools and list SOLVY project files.**

---

## ✅ Final Checklist

Confirm all are working:

- [ ] Homebrew installed (`brew --version` works)
- [ ] VS Code/VSCodium installed (can open app)
- [ ] Git configured (`git config --list` shows your name/email)
- [ ] SSH key created (`cat ~/.ssh/id_ed25519.pub` shows key)
- [ ] Docker running (whale icon in menu bar)
- [ ] Docker working (`docker run hello-world` succeeded)
- [ ] Extensions installed (10 extensions in VS Code)
- [ ] Can open SOLVY project in VS Code
- [ ] Can see Todo Tree in sidebar
- [ ] Aliases working (type `solvy` works)

---

## 🎉 Setup Complete!

**You're ready for Gitea setup tomorrow!**

### What to Do Now

1. **Take a break** ☕
2. **Review:** `GITEA-SETUP-CHECKLIST.md` for tomorrow
3. **Keep handy:** `SEAN-QUICK-REF.md` for daily use

### Tomorrow's Plan

1. Run Gitea setup: `./complete-setup.sh`
2. Create admin account
3. Set up team access
4. Start managing with SCRUM tools!

---

## 🆘 If Something Failed

### "brew: command not found"
- Run: `eval "$(/opt/homebrew/bin/brew shellenv)"`
- Close Terminal, reopen, try again

### VS Code won't open from terminal
- Close VS Code completely
- Run: `killall Code` or `killall Electron`
- Reopen and try again

### Docker won't start
- Check System Preferences → Security & Privacy
- Look for message about "Docker"
- Click "Allow"
- Restart Docker Desktop

### Extensions won't install
- Check internet connection
- Try installing one at a time through UI instead of command line
- Restart VS Code

### Permission errors
- Run: `sudo chown -R $(whoami) /opt/homebrew`
- Try command again

---

## 📞 Help

**Stuck?**
1. Check error message in this checklist
2. Search error on https://stackoverflow.com
3. Contact: @sa-nathan

**Questions about tools?**
- This guide: `SEAN-MACBOOK-SETUP.md`
- Daily reference: `SEAN-QUICK-REF.md`
- Gitea setup: `GITEA-SETUP-CHECKLIST.md`

---

**Started:** _______________  
**Completed:** _______________  
**Total Time:** _______________

**Setup by:** Sean (SCRUM Master) 🚀
