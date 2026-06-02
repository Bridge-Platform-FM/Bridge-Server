const Redis = require('ioredis');
require('dotenv').config();

// const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6381');
const redis = new Redis({
//   host: "https://9670-103-191-205-18.ngrok-free.app",
//   port: 16617,

  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6381,

  password: process.env.REDIS_PASSWORD,
});

redis.on('connect', () => {
    console.info("Redis Connection Established");
});

redis.on('error', (err) => {
    console.error('Redis Error:', err);
});

module.exports = redis;