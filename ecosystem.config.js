module.exports = {
  apps: [
    {
      name: 'backend',
      cwd: './apps/backend',
      script: 'dist/src/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '512M',
      error_file: '../../logs/backend-error.log',
      out_file: '../../logs/backend-out.log',
    },
    {
      name: 'frontend',
      cwd: './apps/frontend',
      script: 'node_modules/.bin/next',
      args: 'start -p 4008',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '512M',
      error_file: '../../logs/frontend-error.log',
      out_file: '../../logs/frontend-out.log',
    },
  ],
};
