# VS Code Setup Guide for SOLVY SOVEREIGNITITY

## Quick Start

### Option 1: Clone from GitHub (Recommended)

```bash
# Clone the repository
git clone https://github.com/SA-Nathan-SOLVY/SOLVY-sovereignitity.git

# Open in VS Code
cd SOLVY-sovereignitity
code SOLVY-sovereignitity.code-workspace
```

### Option 2: Download ZIP

1. Visit: https://github.com/SA-Nathan-SOLVY/SOLVY-sovereignitity
2. Click "Code" → "Download ZIP"
3. Extract to your preferred location
4. Open `SOLVY-sovereignitity.code-workspace` in VS Code

## Workspace Structure

The workspace is organized into multiple folders for easy navigation:

- **🏠 SOLVY SOVEREIGNITITY** - Root folder with main README
- **🛍️ Shop EBL Frontend** - Payment app HTML/CSS/JS
- **⚙️ Shop EBL Backend** - Node.js API server
- **🎓 DECIDEY NGO** - Education site (future)
- **🌐 Sovereignitity Platform** - Main platform (future)

## Recommended VS Code Extensions

The workspace file includes these recommended extensions:

1. **Prettier** - Code formatting
2. **ESLint** - JavaScript linting
3. **Azure Tools** - Node.js development
4. **Stripe** - Stripe API integration
5. **GitHub Actions** - CI/CD workflows

Install all recommended extensions when prompted by VS Code.

## Backend Development Setup

### Install Node.js Dependencies

```bash
cd shop-ebl-backend
npm install
```

### Configure Environment Variables

Create `.env` file in `shop-ebl-backend/`:

```env
PORT=3001
NODE_ENV=development
STRIPE_SECRET_KEY=sk_test_your_test_key_here
MAILCOW_HOST=mail.ebl.beauty
MAILCOW_USER=noreply@ebl.beauty
MAILCOW_PASS=your_password_here
EVA_EMAIL=eva@ebl.beauty
ALLOWED_ORIGINS=http://localhost:3000,https://shop.ebl.beauty
```

**Note**: Use test keys for local development!

### Run Backend Locally

```bash
cd shop-ebl-backend
npm run dev
```

Backend will run on http://localhost:3001

### Test Backend

```bash
# Health check
curl http://localhost:3001/api/health

# Expected: {"status":"ok","message":"EBL Backend API is running"}
```

## Frontend Development Setup

### Run Local Server

```bash
cd shop-ebl-frontend

# Option 1: Python
python3 -m http.server 3000

# Option 2: Node.js http-server
npx http-server -p 3000
```

Frontend will run on http://localhost:3000

### Update API URL for Local Testing

In `index.html`, temporarily change:

```javascript
// For local development
const API_URL = 'http://localhost:3001';

// For production
const API_URL = 'https://api.ebl.beauty';
```

## Git Workflow

### Make Changes

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes...

# Stage changes
git add .

# Commit
git commit -m "Description of changes"

# Push to GitHub
git push origin feature/your-feature-name
```

### Pull Latest Changes

```bash
git pull origin main
```

## Deployment

### Deploy Frontend

```bash
cd shop-ebl-frontend
scp -i ~/.ssh/hetzner_key index.html root@46.62.235.95:/var/www/shop.ebl.beauty/
```

### Deploy Backend

```bash
cd shop-ebl-backend
./deploy.sh
```

See [shop-ebl-backend/README.md](shop-ebl-backend/README.md) for detailed deployment instructions.

## Debugging

### VS Code Launch Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/shop-ebl-backend/server.js",
      "envFile": "${workspaceFolder}/shop-ebl-backend/.env"
    }
  ]
}
```

### Debug Frontend

1. Open `index.html` in browser
2. Open Developer Tools (F12)
3. Set breakpoints in Console → Sources tab

## Testing

### Backend Tests

```bash
cd shop-ebl-backend
npm test
```

### Manual Testing

Follow [shop-ebl-backend/TESTING.md](shop-ebl-backend/TESTING.md) for comprehensive testing procedures.

## Useful VS Code Shortcuts

- **Ctrl+P** - Quick file open
- **Ctrl+Shift+F** - Search across all files
- **Ctrl+`** - Toggle terminal
- **F5** - Start debugging
- **Ctrl+Shift+P** - Command palette

## Folder Navigation

Use the Explorer sidebar to navigate between:

- `shop-ebl-frontend/` - Frontend code
- `shop-ebl-backend/` - Backend API
- Documentation files (*.md)

## Tips

1. **Auto-save**: Enable File → Auto Save
2. **Format on save**: Already configured in workspace
3. **Git integration**: Use Source Control panel (Ctrl+Shift+G)
4. **Terminal**: Integrated terminal at bottom (Ctrl+`)
5. **Extensions**: Install recommended extensions when prompted

## Troubleshooting

### "Module not found" Error

```bash
cd shop-ebl-backend
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Git Authentication

```bash
# Configure Git credentials
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Use GitHub CLI for authentication
gh auth login
```

## Support

For questions or issues:
- Email: eva@ebl.beauty
- GitHub Issues: https://github.com/SA-Nathan-SOLVY/SOLVY-sovereignitity/issues

## Next Steps

1. ✅ Clone repository
2. ✅ Open workspace in VS Code
3. ✅ Install recommended extensions
4. ✅ Set up backend `.env` file
5. ✅ Run backend locally (`npm run dev`)
6. ✅ Run frontend locally (http-server)
7. ✅ Make changes and test
8. ✅ Commit and push to GitHub
9. ✅ Deploy to production

Happy coding! 🚀
