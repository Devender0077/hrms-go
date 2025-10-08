/**
 * PM2 Ecosystem Configuration
 * For production deployment on VPS/Cloud servers
 * 
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 stop all
 *   pm2 restart all
 *   pm2 logs
 *   pm2 monit
 */

module.exports = {
  apps: [
    {
      name: 'hrms-backend',
      script: './src/backend/server.js',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster',
      autorestart: true,
      watch: false, // Set to true in development
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 8000,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 8000,
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      // Auto-restart on crash
      min_uptime: '10s',
      max_restarts: 10,
      // Cron restart (optional - restart every day at 3 AM)
      cron_restart: '0 3 * * *',
    },
  ],
  
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server-ip'],
      ref: 'origin/main',
      repo: 'https://github.com/Devender0077/hrms-go.git',
      path: '/var/www/hrms',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt-get install git -y',
    },
  },
};
