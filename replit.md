# SOLVY SOVEREIGNITITY Platform

## Overview
This is a multi-project monorepo containing the SOLVY SOVEREIGNITITY economic liberation platform. The main application is a React/Vite frontend in the `unified-ecosystem` directory.

## Project Structure
- `unified-ecosystem/` - Main React/Vite frontend (primary app)
- `decidey-ngo-react/` - DECIDEY NGO education site (React)
- `solvy-platform/` - Backend and frontend for SOLVY platform
- `shop-ebl-frontend/` - EBL payment app frontend (static HTML)
- `shop-ebl-backend/` - Node.js API backend

## Running the Project
The main frontend runs on port 5000 using Vite dev server:
```bash
cd unified-ecosystem && npm run dev
```

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite 7, React Router 7
- **Styling**: Tailwind CSS
- **Build**: Vite with TypeScript

## Development
- Frontend binds to `0.0.0.0:5000` for Replit compatibility
- Vite configured with `allowedHosts: true` for proxy access

## Deployment
Static deployment configured to build and serve from `unified-ecosystem/dist`
