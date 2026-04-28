FROM nginx:alpine

# Copy all files to nginx html directory
COPY . /usr/share/nginx/html

# Create custom nginx config for SPA routing with multi-domain support
RUN echo 'server { \
    listen 80; \
    server_name localhost ebl.beauty www.ebl.beauty solvy.cards www.solvy.cards solvy-sovereignitity--smayone.replit.app; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Gzip compression \
    gzip on; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript; \
    \
    # Cache static assets \
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot|webp|pdf)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    # Serve banking subdirectory \
    location /banking/ { \
        alias /usr/share/nginx/html/banking/; \
        try_files $uri $uri/ =404; \
    } \
    \
    # Serve card subdirectory \
    location /card/ { \
        alias /usr/share/nginx/html/card/; \
        try_files $uri $uri/ =404; \
    } \
    \
    # Serve decidey subdirectory \
    location /decidey/ { \
        alias /usr/share/nginx/html/decidey/; \
        try_files $uri $uri/ =404; \
    } \
    \
    # Serve community subdirectory \
    location /community/ { \
        alias /usr/share/nginx/html/community/; \
        try_files $uri $uri/ =404; \
    } \
    \
    # Serve assets directory \
    location /assets/ { \
        alias /usr/share/nginx/html/assets/; \
    } \
    \
    # Handle 404s by serving index.html (SPA routing) \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # Health check endpoint \
    location /health { \
        access_log off; \
        return 200 "healthy\n"; \
        add_header Content-Type text/plain; \
    } \
    \
    # Security headers \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header X-XSS-Protection "1; mode=block" always; \
    add_header Strict-Transport-Security "max-age=63072000" always; \
}' > /etc/nginx/conf.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://localhost/health || exit 1

EXPOSE 80
