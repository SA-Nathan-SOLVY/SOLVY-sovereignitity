# SOLVY Website - Complete Static Version

Replicated from https://sovereignitity-solvy.replit.app with all original content and iterations.

## What's Included

This is the **complete static HTML website** (not a React SPA) with all original content:

- **Main Page** (`index.html`): Full 921-line landing page with:
  - Navigation bar with mobile menu
  - Hero section with SOLVY branding
  - Features grid (6 feature cards)
  - Brochure showcase section (IBC & Data Flywheel PDFs)
  - Partner showcase (Evergreen Beauty Lounge)
  - DECIDEY NGO section
  - KYC/AML compliance section
  - Footer with links
  - PDF modal viewers

- **SPS Joint Venture Page** (`sps/index.html`): Pilot Partner #2 showcase
- **IBC Practitioners Page** (`ibc/index.html`): IBC brochure showcase

- **Assets** (`assets/`):
  - SOV.png - SOLVY Card
  - SOV-personal-mc.png - Personal Mastercard
  - solvy-crown-icon.png - Crown logo
  - solvy-full-logo.png - Full logo
  - fulllogo.png - Alternative logo
  - ebl-logo.png - Evergreen Beauty Lounge logo
  - SolvyLogo-1024.png - App icon
  - hero_payment_image.webp - Hero image
  - sps-presentation/*.webp - 6 presentation slides

- **Brochures** (`brochures/`):
  - solvy-ibc-practitioners.pdf (35MB)
  - solvy-data-flywheel.pdf (58MB)

## Quick Start

### Local Development

```bash
# Serve locally
python3 -m http.server 8080
# or
npx serve .
```

### Docker Deployment

```bash
# Deploy with Docker
./deploy.sh
```

### VPS with Cloudflare Tunnel

```bash
# Copy to server
scp -r replit-deploy/ root@YOUR_VPS_IP:/opt/solvy-web

# SSH and deploy
ssh root@YOUR_VPS_IP
cd /opt/solvy-web
./deploy.sh
```

## Cloudflare Tunnel Setup

1. Go to [Cloudflare Zero Trust](https://one.dash.cloudflare.com)
2. **Networks > Tunnels > Create Tunnel**
3. Select **Cloudflared**, name it `solvy-web`
4. Configure Public Hostname:
   - Subdomain: `solvy`
   - Domain: `yourdomain.com`
   - Type: HTTP
   - URL: `localhost:8080`
5. Copy the tunnel token
6. Add to `.env` file:
   ```
   TUNNEL_TOKEN=your_token_here
   ```
7. Start tunnel:
   ```bash
   docker-compose --profile tunnel up -d tunnel
   ```

## Website Structure

```
replit-deploy/
├── index.html                    # Main landing page (921 lines)
├── sps/
│   └── index.html               # SPS Joint Venture page
├── ibc/
│   └── index.html               # IBC Practitioners page
├── assets/
│   ├── SOV.png                  # SOLVY Card
│   ├── SOV-personal-mc.png      # Personal card
│   ├── solvy-crown-icon.png     # Crown icon
│   ├── solvy-full-logo.png      # Full logo
│   ├── ebl-logo.png             # EBL logo
│   ├── hero_payment_image.webp  # Hero image
│   └── ...
├── sps-presentation/            # SPS slide images
│   ├── pilot_partnership_generated.webp
│   ├── slide_1_opportunity_generated.webp
│   └── ...
├── brochures/                   # PDF brochures
│   ├── solvy-ibc-practitioners.pdf
│   └── solvy-data-flywheel.pdf
├── Dockerfile                   # Nginx container
├── docker-compose.yml           # Docker Compose config
├── deploy.sh                    # Deployment script
└── README.md                    # This file
```

## Management Commands

```bash
# View logs
docker-compose logs -f web

# Stop services
docker-compose stop

# Restart
docker-compose restart

# Full rebuild
docker-compose down
./deploy.sh
```

## Credits

- Original: https://sovereignitity-solvy.replit.app
- Created by SA Nathan
- DECIDEY NGO - Economic Sovereignty Education
