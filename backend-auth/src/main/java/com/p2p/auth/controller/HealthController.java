package com.p2p.auth.controller;

import com.p2p.auth.repository.UserRepository;
import com.p2p.auth.service.RedisService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/infra")
public class HealthController {

    private final RedisService redisService;
    private final UserRepository userRepository;

    public HealthController(RedisService redisService, UserRepository userRepository) {
        this.redisService = redisService;
        this.userRepository = userRepository;
    }

    /**
     * Return the Spring Boot service health status.
     *
     * @return an HTTP 200 response containing service status and timestamp
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("service", "p2p-auth-service");
        status.put("status", "UP");
        status.put("timestamp", Instant.now());
        return ResponseEntity.ok(status);
    }

    /**
     * Check Redis connectivity and report the online-user count.
     *
     * @return an HTTP 200 response with Redis status and online-user count
     */
    @GetMapping("/redis-check")
    public ResponseEntity<Map<String, Object>> redisCheck() {
        boolean connected = redisService.isRedisConnected();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("redis", connected ? "connected" : "disconnected");
        result.put("onlineUserCount", connected ? redisService.getOnlineUserIds().size() : 0);
        return ResponseEntity.ok(result);
    }

    /**
     * Check MySQL connectivity and report the number of users.
     *
     * @return an HTTP 200 response with MySQL status and user count
     */
    @GetMapping("/db-check")
    public ResponseEntity<Map<String, Object>> dbCheck() {
        try {
            long userCount = userRepository.count();
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("mysql", "connected");
            result.put("userCount", userCount);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("mysql", "disconnected");
            result.put("userCount", 0);
            return ResponseEntity.internalServerError().body(result);
        }
    }
}
