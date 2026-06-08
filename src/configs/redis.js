const Redis = require('ioredis');
require('dotenv').config();

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6381');

redis.on('connect', () => {
    console.info("Redis Connection Established");
});

redis.on('error', (err) => {
    console.error('Redis Error:', err);
});

module.exports = redis;