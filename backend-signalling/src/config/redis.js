const redis = require('redis');

const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
});

client.on('error', (err) => console.error('Redis Client Error:', err));
client.on('connect', () => console.log('Redis Client Connected'));
client.on('ready', () => console.log('Redis Client Ready'));

/**
 * Connect to Redis if not already connected.
 * Must be awaited on application startup.
 *
 * @returns {Promise<typeof client>} the connected Redis client
 */
async function connectRedis() {
    if (!client.isOpen) {
        await client.connect();
    }
    return client;
}

module.exports = { client, connectRedis };
