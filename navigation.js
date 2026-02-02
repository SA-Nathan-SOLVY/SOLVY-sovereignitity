// Shared Navigation Component for SOLVY Platform
// Include this in all pages for consistent navigation

const navigationHTML = `
<style>
    .solvy-header {
        background: rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        padding: 1rem 2rem;
        position: sticky;
        top: 0;
        z-index: 1000;
        animation: slideDown 0.5s ease-out;
    }

    @keyframes slideDown {
        from {
            transform: translateY(-100%);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    .solvy-header-content {
        max-width: 1400px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .solvy-logo {
        font-size: 1.5rem;
        font-weight: bold;
        color: #fff;
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .solvy-logo-icon {
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .solvy-logo-icon img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    .solvy-nav {
        display: flex;
        align-items: center;
        gap: 2rem;
    }

    .solvy-nav-item {
        position: relative;
    }

    .solvy-nav-link {
        color: #fff;
        text-decoration: none;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        gap: 0.3rem;
    }

    .solvy-nav-link:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #EC4899;
    }

    .solvy-dropdown {
        position: relative;
    }

    .solvy-dropdown-menu {
        position: absolute;
        top: 100%;
        left: 0;
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        padding: 0.5rem 0;
        min-width: 200px;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.3s;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }

    .solvy-dropdown:hover .solvy-dropdown-menu {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
    }

    .solvy-dropdown-item {
        display: block;
        color: #fff;
        text-decoration: none;
        padding: 0.75rem 1.5rem;
        transition: all 0.3s;
    }

    .solvy-dropdown-item:hover {
        background: rgba(236, 72, 153, 0.2);
        color: #EC4899;
    }

    .solvy-cta-buttons {
        display: flex;
        gap: 1rem;
    }

    .solvy-btn {
        padding: 0.5rem 1.5rem;
        border-radius: 50px;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.3s;
        display: inline-block;
    }

    .solvy-btn-primary {
        background: #EC4899;
        color: #fff;
    }

    .solvy-btn-primary:hover {
        background: #DB2777;
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(236, 72, 153, 0.4);
    }

    .solvy-btn-secondary {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .solvy-btn-secondary:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: #fff;
    }

    .solvy-mobile-menu-toggle {
        display: none;
        background: none;
        border: none;
        color: #fff;
        font-size: 1.5rem;
        cursor: pointer;
    }

    @media (max-width: 968px) {
        .solvy-nav {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.95);
            backdrop-filter: blur(10px);
            flex-direction: column;
            padding: 2rem;
            gap: 1rem;
        }

        .solvy-nav.active {
            display: flex;
        }

        .solvy-mobile-menu-toggle {
            display: block;
        }

        .solvy-dropdown-menu {
            position: static;
            opacity: 1;
            visibility: visible;
            transform: none;
            background: rgba(255, 255, 255, 0.05);
            margin-top: 0.5rem;
        }

        .solvy-cta-buttons {
            flex-direction: column;
            width: 100%;
        }

        .solvy-btn {
            text-align: center;
        }
    }
</style>

<header class="solvy-header">
    <div class="solvy-header-content">
        <a href="index.html" class="solvy-logo">
            <div class="solvy-logo-icon">
                <img src="SolvyLogo-1024.png" alt="SOLVY Logo">
            </div>
            <span>SOLVY</span>
        </a>
        
        <button class="solvy-mobile-menu-toggle" onclick="toggleMobileMenu()">
            ☰
        </button>
        
        <nav class="solvy-nav" id="solvyNav">
            <a href="index.html" class="solvy-nav-link">Home</a>
            
            <div class="solvy-dropdown solvy-nav-item">
                <a href="#" class="solvy-nav-link">
                    About ▼
                </a>
                <div class="solvy-dropdown-menu">
                    <a href="sovereignitity.html" class="solvy-dropdown-item">What is SOVEREIGNITITY™?</a>
                    <a href="communities.html" class="solvy-dropdown-item">Communities We Serve</a>
                </div>
            </div>
            
            <div class="solvy-dropdown solvy-nav-item">
                <a href="#" class="solvy-nav-link">
                    DECIDEY NGO ▼
                </a>
                <div class="solvy-dropdown-menu">
                    <a href="decidey-ngo.html" class="solvy-dropdown-item">DECIDEY Main Site</a>
                    <a href="ibc.html" class="solvy-dropdown-item">IBC Practitioners</a>
                </div>
            </div>
            
            <div class="solvy-dropdown solvy-nav-item">
                <a href="#" class="solvy-nav-link">
                    Services ▼
                </a>
                <div class="solvy-dropdown-menu">
                    <a href="solvy-card.html" class="solvy-dropdown-item">SOLVY Card</a>
                    <a href="remittance.html" class="solvy-dropdown-item">Global Remittance</a>
                    <a href="decidey-ngo.html#financial-literacy" class="solvy-dropdown-item">Financial Literacy</a>
                </div>
            </div>
            
            <div class="solvy-dropdown solvy-nav-item">
                <a href="#" class="solvy-nav-link">
                    Platform ▼
                </a>
                <div class="solvy-dropdown-menu">
                    <a href="index.html#roadmap" class="solvy-dropdown-item">Roadmap</a>
                    <a href="index.html#ecosystem" class="solvy-dropdown-item">Ecosystem</a>
                    <a href="#" class="solvy-dropdown-item">MAN Network</a>
                </div>
            </div>
            
            <div class="solvy-cta-buttons">
                <a href="https://shop.ebl.beauty" class="solvy-btn solvy-btn-primary">Get Started</a>
                <a href="#contact" class="solvy-btn solvy-btn-secondary">Contact</a>
            </div>
        </nav>
    </div>
</header>

<script>
    function toggleMobileMenu() {
        const nav = document.getElementById('solvyNav');
        nav.classList.toggle('active');
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const nav = document.getElementById('solvyNav');
        const toggle = document.querySelector('.solvy-mobile-menu-toggle');
        
        if (!nav.contains(event.target) && !toggle.contains(event.target)) {
            nav.classList.remove('active');
        }
    });
</script>
`;

// Function to inject navigation into page
function injectNavigation() {
    const placeholder = document.getElementById('navigation-placeholder');
    if (placeholder) {
        placeholder.innerHTML = navigationHTML;
    }
}

// Auto-inject on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectNavigation);
} else {
    injectNavigation();
}
