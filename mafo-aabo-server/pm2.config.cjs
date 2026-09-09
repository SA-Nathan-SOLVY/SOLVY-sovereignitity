module.exports = {
  apps: [
    {
      name: 'mafo-api',
      script: 'server.js',
      interpreter: 'node',
      cwd: '/var/www/mafo-aabo',
      env_file: '/var/www/mafo-aabo/.env',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: '/var/log/pm2/mafo-api-error.log',
      out_file:   '/var/log/pm2/mafo-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
