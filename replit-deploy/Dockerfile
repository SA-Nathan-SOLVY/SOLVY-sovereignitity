FROM nginx:alpine

# Copy all files to nginx html directory
COPY . /usr/share/nginx/html

# Create custom nginx config for SPA-like routing with subdirectory support
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
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
    # Serve sps subdirectory \
    location /sps/ { \
        alias /usr/share/nginx/html/sps/; \
        try_files $uri $uri/ =404; \
    } \
    \
    # Serve ibc subdirectory \
    location /ibc/ { \
        alias /usr/share/nginx/html/ibc/; \
        try_files $uri $uri/ =404; \
    } \
    \
    # Serve assets directory \
    location /assets/ { \
        alias /usr/share/nginx/html/assets/; \
    } \
    \
    # Serve brochures directory \
    location /brochures/ { \
        alias /usr/share/nginx/html/brochures/; \
    } \
    \
    # Serve sps-presentation directory \
    location /sps-presentation/ { \
        alias /usr/share/nginx/html/sps-presentation/; \
    } \
    \
    # Handle 404s by serving index.html \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # Security headers \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header X-XSS-Protection "1; mode=block" always; \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
