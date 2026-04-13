#!/usr/bin/env python3
"""
Standardize navigation for replit-deploy pages
"""

import os
import re
from pathlib import Path

BASE_DIR = Path("/Users/smayone/Sovereignitity-Stack/replit-deploy")

PAGES = [
    "index.html",
    "about.html",
    "heritage.html",
    "manifesto.html",
    "sovereignty-vs-hustle.html",
    "ibc/index.html",
    "sps/index.html",
]

def get_prefix(rel_path):
    depth = rel_path.count('/')
    return '../' * depth

def generate_nav(rel_path):
    prefix = get_prefix(rel_path)
    filename = os.path.basename(rel_path)
    
    def active(target):
        if target == rel_path:
            return ' class="active"'
        if filename == 'index.html' and target == 'index.html' and prefix == '':
            return ' class="active"'
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
                <a href="{prefix}index.html"{active('index.html')}>SOLVY Card™</a>
                <a href="{prefix}heritage.html"{active('heritage.html')}>🏛️ Heritage</a>
                <a href="{prefix}manifesto.html"{active('manifesto.html')}>📜 Manifesto</a>
                <a href="{prefix}sovereignty-vs-hustle.html"{active('sovereignty-vs-hustle.html')}>✊ Sovereignty</a>
                <a href="{prefix}about.html"{active('about.html')}>About</a>
                <a href="{prefix}sps/index.html"{active('sps/index.html')}>SPS Joint Venture</a>
                <a href="{prefix}ibc/index.html"{active('ibc/index.html')}>IBC</a>
            </div>
            <div class="nav-cta">
                <a href="#apply" class="btn-primary">Apply for Card</a>
                <a href="#login" class="btn-secondary">Member Login</a>
            </div>
            <div class="hamburger" onclick="toggleMenu()">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
        <div class="mobile-menu" id="mobileMenu">
            <a href="{prefix}index.html">SOLVY Card™</a>
            <a href="{prefix}heritage.html">🏛️ Heritage</a>
            <a href="{prefix}manifesto.html">📜 Manifesto</a>
            <a href="{prefix}sovereignty-vs-hustle.html">✊ Sovereignty</a>
            <a href="{prefix}about.html">About</a>
            <a href="{prefix}sps/index.html">SPS Joint Venture</a>
            <a href="{prefix}ibc/index.html">IBC</a>
        </div>
    </nav>
'''
    return nav

def ensure_toggle_script(content):
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
    content = re.sub(r'(</body>)', script + r'\1', content, flags=re.IGNORECASE)
    return content

def update_page(rel_path):
    filepath = BASE_DIR / rel_path
    if not filepath.exists():
        print(f"⚠️  Skipping missing file: {rel_path}")
        return
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_nav = generate_nav(rel_path)
    
    # Replace existing navbar
    pattern = r'<nav\s+class="navbar"[^>]*>.*?</nav>'
    if re.search(pattern, content, re.DOTALL):
        content = re.sub(pattern, new_nav.strip(), content, flags=re.DOTALL)
        print(f"✅ Updated replit nav: {rel_path}")
    else:
        content = re.sub(r'(<body[^>]*>)', r'\1\n' + new_nav, content, count=1)
        print(f"✅ Inserted replit nav: {rel_path}")
    
    content = ensure_toggle_script(content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for page in PAGES:
    update_page(page)

print("\n🎉 Replit pages updated!")
