const express = require('express');
const router = express.Router();
const redisService = require('../services/redisService');

router.get('/', async (req, res) => {
    const redisConnected = await redisService.isRedisConnected();
    const onlineCount = redisConnected ? (await redisService.getOnlineUserIds()).length : 0;

    res.status(redisConnected ? 200 : 503).json({
        service: 'p2p-signalling-service',
        status: redisConnected ? 'ok' : 'degraded',
        redis: redisConnected ? 'connected' : 'disconnected',
        onlineUsers: onlineCount,
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;
