package com.p2p.auth.service;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RedisService {

    private static final String ONLINE_USERS_KEY = "online:users";

    private final RedisTemplate<String, Object> redisTemplate;

    public RedisService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * Read all online user IDs from Redis.
     *
     * @return a set of user ID strings currently marked online
     */
    public Set<String> getOnlineUserIds() {
        Set<Object> rawIds = redisTemplate.opsForSet().members(ONLINE_USERS_KEY);
        if (rawIds == null) {
            return Set.of();
        }
        return rawIds.stream()
                .map(Object::toString)
                .collect(Collectors.toSet());
    }

    /**
     * Check if a specific user is online.
     *
     * @param userId the database ID of the user to check
     * @return true if the user is in the online set, false otherwise
     */
    public boolean isUserOnline(Long userId) {
        Boolean isMember = redisTemplate.opsForSet().isMember(
                ONLINE_USERS_KEY, String.valueOf(userId));
        return Boolean.TRUE.equals(isMember);
    }

    /**
     * Health check — can Spring Boot reach Redis?
     *
     * @return true if Redis responds with PONG, false on any error
     */
    public boolean isRedisConnected() {
        try {
            Object ping = redisTemplate.getConnectionFactory()
                    .getConnection()
                    .ping();
            return "PONG".equals(ping);
        } catch (Exception e) {
            return false;
        }
    }
}
