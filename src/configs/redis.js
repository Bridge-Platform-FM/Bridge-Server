const Redis = require('ioredis');
require('dotenv').config();

let host, port, password;
if (process.env.APP_ENV === 'uat') {
    host = process.env.REDIS_UAT_HOST;
    port = process.env.REDIS_UAT_PORT;
    password = process.env.REDIS_UAT_PASSWORD;
} else {
    host = process.env.REDIS_HOST;
    port = process.env.REDIS_PORT;
    password = process.env.REDIS_PASSWORD;
}

const redis = new Redis({
    host: host,
    port: port,
    password: password
});

redis.on('connect', () => {
    console.info("Redis Connection Established");
});

redis.on('error', (err) => {
    console.error('Redis Error:', err);
});

module.exports = redis;