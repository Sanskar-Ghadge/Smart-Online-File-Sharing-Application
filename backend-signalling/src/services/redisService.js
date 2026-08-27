const { client } = require('../config/redis');

const ONLINE_USERS_KEY = 'online:users';
const ONLINE_META_PREFIX = 'online:';

/**
 * Redis service that manages the online-status store.
 * Node.js owns writes; Spring Boot reads via its own RedisService.
 */
class RedisService {

    /**
     * Mark a user as online. Called on Socket.IO connect.
     *
     * @param {number|string} userId - the database ID of the user
     * @param {string} socketId - the Socket.IO socket ID
     * @param {string} [ip='unknown'] - the IP address of the connecting client
     * @returns {Promise<void>}
     */
    async setUserOnline(userId, socketId, ip) {
        const multi = client.multi();
        multi.sAdd(ONLINE_USERS_KEY, String(userId));
        multi.hSet(`${ONLINE_META_PREFIX}${userId}:meta`, {
            socketId,
            connectedAt: new Date().toISOString(),
            ip: ip || 'unknown',
        });
        multi.expire(`${ONLINE_META_PREFIX}${userId}:meta`, 60);
        await multi.exec();
    }

    /**
     * Mark a user as offline. Called on Socket.IO disconnect.
     *
     * @param {number|string} userId - the database ID of the user
     * @returns {Promise<void>}
     */
    async setUserOffline(userId) {
        const multi = client.multi();
        multi.sRem(ONLINE_USERS_KEY, String(userId));
        multi.del(`${ONLINE_META_PREFIX}${userId}:meta`);
        await multi.exec();
    }

    /**
     * Refresh the TTL on the user's metadata key.
     * Called every 30 seconds on heartbeat.
     *
     * @param {number|string} userId - the database ID of the user
     * @returns {Promise<void>}
     */
    async refreshHeartbeat(userId) {
        await client.expire(`${ONLINE_META_PREFIX}${userId}:meta`, 60);
    }

    /**
     * Get all online user IDs.
     *
     * @returns {Promise<string[]>} array of user ID strings
     */
    async getOnlineUserIds() {
        return await client.sMembers(ONLINE_USERS_KEY);
    }

    /**
     * Health check — can Node.js reach Redis?
     *
     * @returns {Promise<boolean>} true if Redis responds with PONG
     */
    async isRedisConnected() {
        try {
            const result = await client.ping();
            return result === 'PONG';
        } catch {
            return false;
        }
    }
}

module.exports = new RedisService();
