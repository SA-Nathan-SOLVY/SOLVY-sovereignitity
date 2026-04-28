module.exports = {
  apps: [
    {
      name: 'solvy-api',
      script: 'server/vps.mjs',
      interpreter: 'node',
      cwd: '/var/www/solvy-ecosystem',
      env_file: '/var/www/solvy-ecosystem/.env',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      // Match Replit Production: 2 vCPU / 4 GiB RAM
      exec_mode: 'cluster',
      instances: 2,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      error_file: '/var/log/pm2/solvy-api-error.log',
      out_file:   '/var/log/pm2/solvy-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
