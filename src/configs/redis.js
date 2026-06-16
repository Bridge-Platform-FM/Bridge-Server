const Redis = require('ioredis');
require('dotenv').config();

const redis = new Redis({
//   host: "https://c6de-103-191-205-18.ngrok-free.app",
//   port: 6381,

    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6381,
    password: process.env.REDIS_PASSWORD,
    // uat
    username: process.env.REDIS_USERNAME,
});


redis.on('connect', () => {
    console.info("Redis Connection Established");
});

redis.on('error', (err) => {
    console.error('Redis Error:', err);
});

module.exports = redis;