const { createClient } = require('redis');
const url = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({ url });

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

module.exports = { redisClient, connectRedis };
