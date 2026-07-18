// PM2 process definition for the SAWA server.
//
// Cluster mode runs one Node worker per instance so we use more than a single
// CPU core. Two hard safety constraints drive the instance count:
//
//   1. Socket.IO real-time events only cross workers when the Redis adapter is
//      active (see src/sockets/index.ts). WITHOUT Redis we MUST stay at a single
//      worker, otherwise a message sent on worker A never reaches a client on
//      worker B. So: no REDIS_URL  →  instances = 1.
//
//   2. Every worker owns its own Prisma pool (connection_limit=5, see
//      src/lib/prisma.ts). Total Postgres connections = instances × 5, so we
//      keep the default conservative (2 workers → 10 connections) and let ops
//      scale up explicitly via WEB_CONCURRENCY once DB headroom is confirmed.
//
// WEB_CONCURRENCY accepts a number or the string "max" (one worker per core).
const hasRedis = !!process.env.REDIS_URL;
const instances = hasRedis ? (process.env.WEB_CONCURRENCY || 2) : 1;

module.exports = {
  apps: [
    {
      name: 'sawa-server',
      script: 'dist/server.js',

      exec_mode: 'cluster',
      instances,

      // Restart a worker if it exceeds this RSS limit (keeps Railway container healthy).
      max_memory_restart: '400M',

      // Give each worker up to 30 s to bind its port before PM2 marks it failed.
      listen_timeout: 30000,

      // Grace period for in-flight requests on shutdown (matches server.ts timeout).
      kill_timeout: 10000,

      // Exponential back-off on crashes (avoids rapid crash-loops).
      exp_backoff_restart_delay: 200,
      max_restarts: 10,

      // Environment is inherited from Railway; set NODE_ENV as fallback only.
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
