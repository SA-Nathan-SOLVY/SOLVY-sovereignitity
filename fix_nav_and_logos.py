#!/usr/bin/env python3
"""
Standardize navigation and logos across all SOLVY HTML pages
"""

import os
import re
from pathlib import Path

BASE_DIR = Path("/Users/smayone/Sovereignitity-Stack/solvy-platform")

# Pages to update (relative to solvy-platform/)
PAGES = [
    "index.html",
    "about.html",
    "heritage.html",
    "manifesto.html",
    "sovereignty-vs-hustle.html",
    "onboarding.html",
    "privacy-dashboard.html",
    "banking/index.html",
    "card/solvy-card.html",
    "card/card-customizer.html",
    "remittance/remittance.html",
    "invoice/invoice-management.html",
    "sps-pilot/index.html",
    "community/communities.html",
    "decidey/decidey-ngo.html",
    "payment/payment.html",
    "operations/operations-dashboard.html",
]

# Determine path prefix based on file depth
def get_prefix(rel_path):
    depth = rel_path.count('/')
    return '../' * depth

def generate_nav(rel_path):
    prefix = get_prefix(rel_path)
    filename = os.path.basename(rel_path)
    
    # Determine active state
    def active(target):
        if target == rel_path:
            return ' class="active"'
        # For index.html in root, also mark Home as active when on root index
        if filename == 'index.html' and target == 'index.html' and prefix == '':
            return ' class="active"'
        # For subdirectory index pages, mark their own link active
        if target.endswith('/index.html') and rel_path == target:
            return ' class="active"'
        return ''
    
    nav = f'''    <nav class="navbar">
        <div class="nav-container">
            <a href="{prefix}index.html" class="nav-logo">
                <img src="{prefix}assets/solvy-crown-icon.png" alt="SOLVY" style="height: 45px; width: auto;">
                <span class="nav-logo-text">SOLVY</span>
            </a>
            <div class="nav-links">
                <a href="{prefix}index.html"{active('index.html')}>Home</a>
                <a href="{prefix}about.html"{active('about.html')}>About</a>
                <a href="{prefix}heritage.html"{active('heritage.html')}>🏛️ Heritage</a>
                <a href="{prefix}manifesto.html"{active('manifesto.html')}>📜 Manifesto</a>
                <a href="{prefix}sovereignty-vs-hustle.html"{active('sovereignty-vs-hustle.html')}>✊ Sovereignty</a>
                <a href="{prefix}banking/index.html"{active('banking/index.html')}>🏦 Banking</a>
                <a href="{prefix}card/solvy-card.html"{active('card/solvy-card.html')}>💳 SOLVY Card™</a>
                <a href="{prefix}remittance/remittance.html"{active('remittance/remittance.html')}>Remittance</a>
                <a href="{prefix}invoice/invoice-management.html"{active('invoice/invoice-management.html')}>Invoices</a>
                <a href="{prefix}sps-pilot/index.html"{active('sps-pilot/index.html')}>SPS Pilot</a>
                <a href="{prefix}community/communities.html"{active('community/communities.html')}>Community</a>
                <a href="{prefix}decidey/decidey-ngo.html"{active('decidey/decidey-ngo.html')}>DECIDEY</a>
                <a href="{prefix}internal/man-portal.html" style="color: #94a3b8; font-size: 0.75rem;">📊 MAN <span style="background: rgba(148,163,184,0.2); padding: 1px 4px; border-radius: 3px;">Internal</span></a>
            </div>
            <div class="nav-cta">
                <a href="{prefix}onboarding.html" class="btn-primary">Join First Circle</a>
            </div>
            <div class="hamburger" onclick="toggleMenu()">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
        <div class="mobile-menu" id="mobileMenu">
            <a href="{prefix}index.html">Home</a>
            <a href="{prefix}about.html">About</a>
            <a href="{prefix}heritage.html">🏛️ Heritage</a>
            <a href="{prefix}manifesto.html">📜 Manifesto</a>
            <a href="{prefix}sovereignty-vs-hustle.html">✊ Sovereignty</a>
            <a href="{prefix}banking/index.html">🏦 Banking</a>
            <a href="{prefix}card/solvy-card.html">💳 SOLVY Card™</a>
            <a href="{prefix}remittance/remittance.html">Remittance</a>
            <a href="{prefix}invoice/invoice-management.html">Invoices</a>
            <a href="{prefix}sps-pilot/index.html">SPS Pilot</a>
            <a href="{prefix}community/communities.html">Community</a>
            <a href="{prefix}decidey/decidey-ngo.html">DECIDEY</a>
        </div>
    </nav>
'''
    return nav

def ensure_toggle_script(content):
    """Ensure toggleMenu() script exists before </body>"""
    if 'function toggleMenu()' in content:
        return content
    
    script = '''
    <script>
        function toggleMenu() {
            document.querySelector('.hamburger').classList.toggle('active');
            document.getElementById('mobileMenu').classList.toggle('active');
        }
        document.querySelectorAll('.mobile-menu a').forEach(link => {
            link.addEventListener('click', toggleMenu);
        });
    </script>
'''
    # Insert before </body>
    content = re.sub(r'(</body>)', script + r'\1', content, flags=re.IGNORECASE)
    return content

def update_page(rel_path):
    filepath = BASE_DIR / rel_path
    if not filepath.exists():
        print(f"⚠️  Skipping missing file: {rel_path}")
        return
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Generate new nav
    new_nav = generate_nav(rel_path)
    
    # Replace existing navbar (handle various nav patterns)
    # Pattern 1: Standard navbar with class="navbar"
    pattern1 = r'<nav\s+class="navbar"[^>]*>.*?</nav>'
    # Pattern 2: Simple nav without class
    pattern2 = r'<nav>.*?</nav>'
    
    if re.search(pattern1, content, re.DOTALL):
        content = re.sub(pattern1, new_nav.strip(), content, flags=re.DOTALL)
        print(f"✅ Updated navbar: {rel_path}")
    elif re.search(pattern2, content, re.DOTALL) and '<nav>' in content.split('<body>')[1].split('</body>')[0]:
        content = re.sub(pattern2, new_nav.strip(), content, count=1, flags=re.DOTALL)
        print(f"✅ Updated simple nav: {rel_path}")
    else:
        # Insert after <body> tag
        content = re.sub(r'(<body[^>]*>)', r'\1\n' + new_nav, content, count=1)
        print(f"✅ Inserted navbar: {rel_path}")
    
    # Ensure toggle script exists
    content = ensure_toggle_script(content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# Run updates
for page in PAGES:
    update_page(page)

print("\n🎉 All pages updated with consistent nav and logos!")
