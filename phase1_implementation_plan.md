# Phase 1 — Project Setup, DB Schema & Infrastructure

## Implementation Plan

---

## 1. Overview

Phase 1 is the **foundation layer** — everything in Phases 2–8 depends on these services running and communicating correctly. The goal is NOT to build any user-facing features yet. The goal is to have all 5 services running locally, connected, and verifiable with smoke tests.

---

## 2. Deliverables (Acceptance Criteria)

By the end of Phase 1, ALL of the following must be true:

| # | Deliverable | How to Verify |
|---|---|---|
| D1 | Spring Boot starts on port 8080, connects to MySQL and Redis | `curl http://localhost:8080/actuator/health` returns `UP` |
| D2 | Node.js starts on port 3001, connects to Redis | `curl http://localhost:3001/health` returns `{"status":"ok","redis":"connected"}` |
| D3 | React dev server starts on port 5173 | Browser loads `http://localhost:5173`, shows a placeholder page |
| D4 | MySQL database `p2p_file_sharing` exists with `users` table | MySQL Workbench or `SHOW TABLES` confirms it |
| D5 | Redis is running and both backends can read/write the same key | Node.js writes `online:users` set → Spring Boot reads it via `/infra/redis-check` |
| D6 | CORS is configured — React can call both Spring Boot and Node.js without browser errors | Open browser console at `http://localhost:5173`, no CORS errors on test fetch |
| D7 | Git repository initialized with proper `.gitignore` for all three projects | `git log` shows initial commit |
| D8 | Environment configuration files exist for all three projects with correct defaults | `.env` files present, `application.yml` present, no hardcoded secrets |

---

## 3. Repository Structure

Single monorepo with three sub-projects:

```
smart-file-sharing/
├── .gitignore
├── README.md
├── docker-compose.yml              # MySQL + Redis containers
│
├── backend-auth/                   # Spring Boot (Java 17+, Maven)
│   ├── pom.xml
│   ├── src/
│   │   └── main/
│   │       ├── java/com/p2p/auth/
│   │       │   ├── AuthApplication.java
│   │       │   ├── config/
│   │       │   │   ├── SecurityConfig.java
│   │       │   │   ├── RedisConfig.java
│   │       │   │   ├── CorsConfig.java
│   │       │   │   └── WebConfig.java
│   │       │   ├── controller/
│   │       │   │   └── HealthController.java
│   │       │   ├── entity/
│   │       │   │   └── User.java
│   │       │   ├── repository/
│   │       │   │   └── UserRepository.java
│   │       │   └── service/
│   │       │       └── RedisService.java
│   │       └── resources/
│   │           ├── application.yml
│   │           └── schema.sql
│   └── .env.example
│
├── backend-signalling/             # Node.js (Express + Socket.IO)
│   ├── package.json
│   ├── src/
│   │   ├── app.js
│   │   ├── config/
│   │   │   └── redis.js
│   │   ├── routes/
│   │   │   └── health.js
│   │   └── services/
│   │       └── redisService.js
│   ├── .env.example
│   └── .gitignore
│
└── frontend/                       # React (Vite)
    ├── package.json
    ├── vite.config.js
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── App.css
    ├── .env.example
    └── .gitignore
```

---

## 4. Docker Compose — MySQL + Redis

File: `docker-compose.yml` at repo root.

```yaml
version: "3.8"

services:
  mysql:
    image: mysql:8.0
    container_name: p2p-mysql
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: p2p_file_sharing
      MYSQL_USER: p2p_user
      MYSQL_PASSWORD: p2p_password
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: p2p-redis
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  mysql_data:
```

**Start command:** `docker-compose up -d`

**Verify:**
- MySQL: `docker exec -it p2p-mysql mysql -u p2p_user -pp2p_password p2p_file_sharing -e "SELECT 1"`
- Redis: `docker exec -it p2p-redis redis-cli ping` → returns `PONG`

---

## 5. MySQL Schema

### 5.1 Database

Database `p2p_file_sharing` is auto-created by the Docker `MYSQL_DATABASE` env var.

### 5.2 Users Table

File: `backend-auth/src/main/resources/schema.sql`

```sql
CREATE TABLE IF NOT EXISTS users (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    username        VARCHAR(50)     NOT NULL,
    email           VARCHAR(100)    NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    status          ENUM('ONLINE', 'OFFLINE') NOT NULL DEFAULT 'OFFLINE',
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_username (username),
    UNIQUE KEY uk_email (email),
    KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 5.3 Column Decisions

| Column | Type | Rationale |
|---|---|---|
| `id` | `BIGINT AUTO_INCREMENT` | Scales to billions. Auto-increment is simple and correct for a single-server DB. |
| `username` | `VARCHAR(50) UNIQUE` | Display name. 50 chars is generous. Unique constraint prevents duplicates at DB level. |
| `email` | `VARCHAR(100) UNIQUE` | Login identifier. Unique constraint. 100 chars per RFC 5321. |
| `password_hash` | `VARCHAR(255)` | BCrypt output is 60 chars. VARCHAR(255) future-proofs for Argon2 or longer hashes. |
| `status` | `ENUM('ONLINE','OFFLINE')` | Only two states. ENUM is storage-efficient and validated at DB level. **Note:** actual online/offline truth comes from Redis; this column is a persistent fallback. |
| `created_at` | `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` | Auto-set on insert. |
| `updated_at` | `TIMESTAMP DEFAULT ... ON UPDATE CURRENT_TIMESTAMP` | Auto-updated on every row change. |

### 5.4 JPA Entity

File: `backend-auth/src/main/java/com/p2p/auth/entity/User.java`

```java
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private UserStatus status = UserStatus.OFFLINE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and setters for all fields
}
```

Enum: `UserStatus.java`

```java
public enum UserStatus {
    ONLINE, OFFLINE
}
```

### 5.5 Repository

File: `backend-auth/src/main/java/com/p2p/auth/repository/UserRepository.java`

```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
```

---

## 6. Redis Configuration

### 6.1 Key Schema

| Redis Key | Type | Written By | Read By | TTL | Purpose |
|---|---|---|---|---|---|
| `online:users` | SET of user IDs | Node.js | Spring Boot | None (manual remove on disconnect) | Set of all currently online user IDs |
| `online:{userId}:meta` | HASH | Node.js | Spring Boot | 60s (refreshed on heartbeat) | Metadata: `socketId`, `connectedAt`, `ip` |

**Why SET for `online:users`:** O(1) add/remove, O(N) to get all. Efficient for "who is online?" queries.

**Why HASH with TTL for `online:{userId}:meta`:** If a user's socket drops without a clean disconnect, the TTL ensures they're eventually marked offline. Node.js refreshes the TTL every 30s on heartbeat.

### 6.2 Spring Boot Redis Config

File: `backend-auth/src/main/java/com/p2p/auth/config/RedisConfig.java`

```java
@Configuration
public class RedisConfig {

    @Value("${spring.data.redis.host}")
    private String redisHost;

    @Value("${spring.data.redis.port}")
    private int redisPort;

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        RedisStandaloneConfiguration config = new RedisStandaloneConfiguration(redisHost, redisPort);
        return new LettuceConnectionFactory(config);
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new StringRedisSerializer());
        template.afterPropertiesSet();
        return template;
    }
}
```

### 6.3 Spring Boot Redis Service

File: `backend-auth/src/main/java/com/p2p/auth/service/RedisService.java`

```java
@Service
public class RedisService {

    private static final String ONLINE_USERS_KEY = "online:users";

    private final RedisTemplate<String, Object> redisTemplate;

    public RedisService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /** Read all online user IDs from Redis. */
    public Set<String> getOnlineUserIds() {
        return redisTemplate.opsForSet().members(ONLINE_USERS_KEY);
    }

    /** Check if a specific user is online. */
    public boolean isUserOnline(Long userId) {
        return Boolean.TRUE.equals(
            redisTemplate.opsForSet().isMember(ONLINE_USERS_KEY, String.valueOf(userId))
        );
    }

    /** Health check — can Spring Boot reach Redis? */
    public boolean isRedisConnected() {
        try {
            return "PONG".equals(
                redisTemplate.getConnectionFactory()
                           .getConnection()
                           .ping()
            );
        } catch (Exception e) {
            return false;
        }
    }
}
```

### 6.4 Node.js Redis Config

File: `backend-signalling/src/config/redis.js`

```javascript
const redis = require('redis');

const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
});

client.on('error', (err) => console.error('Redis Client Error:', err));
client.on('connect', () => console.log('Redis Client Connected'));

// Connect on startup — caller must await this
async function connectRedis() {
    if (!client.isOpen) {
        await client.connect();
    }
    return client;
}

module.exports = { client, connectRedis };
```

### 6.5 Node.js Redis Service

File: `backend-signalling/src/services/redisService.js`

```javascript
const { client } = require('../config/redis');

const ONLINE_USERS_KEY = 'online:users';
const ONLINE_META_PREFIX = 'online:';

class RedisService {
    /** Mark a user as online. Called on Socket.IO connect. */
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

    /** Mark a user as offline. Called on Socket.IO disconnect. */
    async setUserOffline(userId) {
        const multi = client.multi();
        multi.sRem(ONLINE_USERS_KEY, String(userId));
        multi.del(`${ONLINE_META_PREFIX}${userId}:meta`);
        await multi.exec();
    }

    /** Refresh TTL on heartbeat. Called every 30s. */
    async refreshHeartbeat(userId) {
        await client.expire(`${ONLINE_META_PREFIX}${userId}:meta`, 60);
    }

    /** Get all online user IDs. */
    async getOnlineUserIds() {
        return await client.sMembers(ONLINE_USERS_KEY);
    }

    /** Health check — can Node.js reach Redis? */
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
```

---

## 7. Spring Boot Configuration

### 7.1 application.yml

File: `backend-auth/src/main/resources/application.yml`

```yaml
server:
  port: 8080

spring:
  application:
    name: p2p-auth-service
  datasource:
    url: jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:p2p_file_sharing}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
    username: ${DB_USER:p2p_user}
    password: ${DB_PASSWORD:p2p_password}
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: none           # We use schema.sql — never auto-DDL in production
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
        format_sql: true
  sql:
    init:
      mode: always             # Run schema.sql on startup
      schema-locations: classpath:schema.sql
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}

# JWT — placeholder for Phase 2
jwt:
  secret: ${JWT_SECRET:change-me-to-a-256-bit-secret-in-production}
  expiration: 86400000         # 24 hours in milliseconds

# CORS
cors:
  allowed-origins: ${CORS_ORIGINS:http://localhost:5173,http://localhost:3000}

# Actuator
management:
  endpoints:
    web:
      exposure:
        include: health,info
  endpoint:
    health:
      show-details: always
```

### 7.2 CORS Config

File: `backend-auth/src/main/java/com/p2p/auth/config/CorsConfig.java`

```java
@Configuration
public class CorsConfig {

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

### 7.3 Security Config (Phase 1 — Permit All)

File: `backend-auth/src/main/java/com/p2p/auth/config/SecurityConfig.java`

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())           // Disable CSRF for REST API
            .cors(cors -> cors.disable())            // Handled by CorsFilter bean above
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/**", "/infra/**").permitAll()
                .anyRequest().permitAll()            // Phase 1 only — all endpoints open. JWT lock comes in Phase 2.
            );
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();          // Ready for Phase 2
    }
}
```

### 7.4 Health Controller

File: `backend-auth/src/main/java/com/p2p/auth/controller/HealthController.java`

```java
@RestController
@RequestMapping("/infra")
public class HealthController {

    private final RedisService redisService;
    private final UserRepository userRepository;

    public HealthController(RedisService redisService, UserRepository userRepository) {
        this.redisService = redisService;
        this.userRepository = userRepository;
    }

    /** Spring Boot health: is the service alive? */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("service", "p2p-auth-service");
        status.put("status", "UP");
        status.put("timestamp", Instant.now());
        return ResponseEntity.ok(status);
    }

    /** Redis connectivity check from Spring Boot. */
    @GetMapping("/redis-check")
    public ResponseEntity<Map<String, Object>> redisCheck() {
        boolean connected = redisService.isRedisConnected();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("redis", connected ? "connected" : "disconnected");
        result.put("onlineUserCount", connected ? redisService.getOnlineUserIds().size() : 0);
        return ResponseEntity.ok(result);
    }

    /** MySQL connectivity check from Spring Boot. */
    @GetMapping("/db-check")
    public ResponseEntity<Map<String, Object>> dbCheck() {
        long userCount = userRepository.count();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("mysql", "connected");
        result.put("userCount", userCount);
        return ResponseEntity.ok(result);
    }
}
```

### 7.5 Maven Dependencies (pom.xml)

File: `backend-auth/pom.xml` — key dependencies only:

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.5</version>
</parent>

<dependencies>
    <!-- Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- Security (BCrypt ready, JWT in Phase 2) -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>

    <!-- JPA / Hibernate -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>

    <!-- MySQL -->
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <scope>runtime</scope>
    </dependency>

    <!-- Redis -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-redis</artifactId>
    </dependency>

    <!-- Actuator -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>

    <!-- Lombok (optional, reduces boilerplate) -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```

---

## 8. Node.js Configuration

### 8.1 package.json

File: `backend-signalling/package.json`

```json
{
  "name": "p2p-signalling-service",
  "version": "1.0.0",
  "description": "Signalling and real-time service for P2P Chat & File Sharing",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js"
  },
  "dependencies": {
    "express": "^4.19.2",
    "socket.io": "^4.7.5",
    "redis": "^4.6.7",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
```

### 8.2 .env.example

File: `backend-signalling/.env.example`

```
PORT=3001
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:5173
```

### 8.3 app.js

File: `backend-signalling/src/app.js`

```javascript
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { connectRedis } = require('./config/redis');
const healthRoute = require('./routes/health');

const app = express();
const server = http.createServer(app);

// CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    credentials: true,
}));
app.use(express.json());

// Socket.IO (setup only — event handlers come in Phase 2+)
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Phase 2 will add: io.use(jwtAuthMiddleware)
// Phase 2 will add: io.on('connection', (socket) => { ... })

// Health route
app.use('/health', healthRoute);

// Start
const PORT = process.env.PORT || 3001;

async function start() {
    try {
        await connectRedis();
        server.listen(PORT, () => {
            console.log(`Signalling service running on port ${PORT}`);
            console.log(`Socket.IO ready`);
        });
    } catch (err) {
        console.error('Failed to start:', err);
        process.exit(1);
    }
}

start();
```

### 8.4 Health Route

File: `backend-signalling/src/routes/health.js`

```javascript
const express = require('express');
const router = express.Router();
const redisService = require('../services/redisService');

router.get('/', async (req, res) => {
    const redisConnected = await redisService.isRedisConnected();
    const onlineCount = redisConnected ? (await redisService.getOnlineUserIds()).length : 0;
    res.json({
        service: 'p2p-signalling-service',
        status: 'ok',
        redis: redisConnected ? 'connected' : 'disconnected',
        onlineUsers: onlineCount,
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;
```

---

## 9. React (Vite) Setup

### 9.1 package.json

File: `frontend/package.json`

```json
{
  "name": "p2p-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "axios": "^1.7.2",
    "socket.io-client": "^4.7.5"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^5.3.1"
  }
}
```

### 9.2 vite.config.js

File: `frontend/vite.config.js`

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            // Proxy API calls to Spring Boot during dev
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
            },
            // Proxy Socket.IO to Node.js during dev
            '/socket.io': {
                target: 'http://localhost:3001',
                changeOrigin: true,
                ws: true,
            },
        },
    },
});
```

### 9.3 .env.example

File: `frontend/.env.example`

```
VITE_API_BASE_URL=http://localhost:8080
VITE_SOCKET_URL=http://localhost:3001
```

### 9.4 App.jsx (Placeholder)

File: `frontend/src/App.jsx`

```jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

function App() {
    const [authHealth, setAuthHealth] = useState(null);
    const [signallingHealth, setSignallingHealth] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check Spring Boot health
        axios.get(`${API_BASE}/infra/health`)
            .then(res => setAuthHealth(res.data))
            .catch(err => setError(err.message));

        // Check Node.js health
        axios.get(`${SOCKET_URL}/health`)
            .then(res => setSignallingHealth(res.data))
            .catch(err => setError(err.message));

        // Socket.IO connection test
        const socket = io(SOCKET_URL);
        socket.on('connect', () => console.log('Socket.IO connected:', socket.id));
        socket.on('disconnect', () => console.log('Socket.IO disconnected'));
        return () => socket.disconnect();
    }, []);

    return (
        <div className="app">
            <h1>Secure P2P Chat &amp; File Sharing</h1>
            <p className="subtitle">Phase 1 — Infrastructure Status</p>

            {error && <div className="error">Connection Error: {error}</div>}

            <div className="status-cards">
                <div className="status-card">
                    <h3>Auth Service (Spring Boot)</h3>
                    {authHealth ? (
                        <pre>{JSON.stringify(authHealth, null, 2)}</pre>
                    ) : (
                        <p>Connecting...</p>
                    )}
                </div>

                <div className="status-card">
                    <h3>Signalling Service (Node.js)</h3>
                    {signallingHealth ? (
                        <pre>{JSON.stringify(signallingHealth, null, 2)}</pre>
                    ) : (
                        <p>Connecting...</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
```

---

## 10. Git Setup

### 10.1 .gitignore (repo root)

```
# IDE
.idea/
.vscode/
*.iml

# OS
.DS_Store
Thumbs.db

# Env files (only .env.example committed)
.env
!.env.example

# Java
backend-auth/target/
backend-auth/*.jar
backend-auth/*.war

# Node
backend-signalling/node_modules/
backend-signalling/dist/

# React
frontend/node_modules/
frontend/dist/
frontend/build/

# Docker volumes
mysql_data/
```

### 10.2 Initial Commit

```bash
git init
git add .
git commit -m "Phase 1: project scaffolding, DB schema, Redis config, CORS, health checks"
```

---

## 11. Step-by-Step Build Order

Follow this exact sequence. Do not skip steps.

### Step 1: Docker Infrastructure (5 min)

```bash
docker-compose up -d
# Verify:
docker exec -it p2p-mysql mysql -u p2p_user -pp2p_password p2p_file_sharing -e "SELECT 1"
docker exec -it p2p-redis redis-cli ping
```

**If this fails:** Stop. Do not proceed. Fix Docker/MySQL/Redis before anything else.

### Step 2: Git Repository (2 min)

```bash
mkdir smart-file-sharing
cd smart-file-sharing
git init
# Create .gitignore from Section 10.1
# Create README.md
git add . && git commit -m "initial repo setup"
```

### Step 3: Spring Boot Project (15 min)

1. Create `backend-auth/` directory structure from Section 3
2. Write `pom.xml` with dependencies from Section 7.5
3. Write `application.yml` from Section 7.1
4. Write `schema.sql` from Section 5.2
5. Write Java classes: `AuthApplication`, `User`, `UserStatus`, `UserRepository`, `RedisConfig`, `RedisService`, `CorsConfig`, `SecurityConfig`, `HealthController`
6. Run: `cd backend-auth && mvn spring-boot:run`
7. Verify: `curl http://localhost:8080/infra/health` → returns JSON with `"status": "UP"`
8. Verify: `curl http://localhost:8080/infra/redis-check` → returns `"redis": "connected"`
9. Verify: `curl http://localhost:8080/infra/db-check` → returns `"mysql": "connected"`

**If any verify fails:** Check Docker containers are running, check `application.yml` DB/Redis host+port.

### Step 4: Node.js Project (10 min)

1. Create `backend-signalling/` directory structure from Section 3
2. Write `package.json` from Section 8.1
3. Run: `cd backend-signalling && npm install`
4. Write `.env` from `.env.example`
5. Write `app.js`, `redis.js`, `redisService.js`, `health.js`
6. Run: `npm run dev`
7. Verify: `curl http://localhost:3001/health` → returns `"redis": "connected"`

**If Redis shows "disconnected":** Check Docker Redis is running, check `.env` REDIS_URL.

### Step 5: React Project (5 min)

1. Create `frontend/` directory structure from Section 3
2. Write `package.json` from Section 9.1
3. Run: `cd frontend && npm install`
4. Write `vite.config.js` from Section 9.2
5. Write `.env` from `.env.example`
6. Write `App.jsx` and `App.css`
7. Run: `npm run dev`
8. Open `http://localhost:5173` — should see the status dashboard
9. Both Spring Boot and Node.js health JSONs should display
10. Browser console should show "Socket.IO connected" (no CORS errors)

**If CORS errors appear:** Check `application.yml` `cors.allowed-origins` includes `http://localhost:5173`. Check Node.js `.env` CORS_ORIGIN.

### Step 6: Cross-Service Redis Smoke Test (5 min)

1. In Node.js Redis CLI or a test script, write a user ID to the `online:users` set:
   ```bash
   docker exec -it p2p-redis redis-cli SADD "online:users" "1"
   ```
2. Verify Spring Boot can read it:
   ```bash
   curl http://localhost:8080/infra/redis-check
   ```
   Should show `"onlineUserCount": 1`
3. Clean up:
   ```bash
   docker exec -it p2p-redis redis-cli SREM "online:users" "1"
   ```
4. Verify count drops back to 0.

**If count is 0 after adding:** Spring Boot is reading from a different Redis instance or key. Check host/port in both configs.

### Step 7: Git Commit (2 min)

```bash
git add .
git commit -m "Phase 1 complete: Spring Boot + Node.js + React scaffolding, MySQL schema, Redis shared store, CORS, health checks"
```

---

## 12. Completion Checklist

Check every box before moving to Phase 2:

- [ ] `docker-compose up -d` starts MySQL + Redis without errors
- [ ] MySQL: `p2p_file_sharing` database exists, `users` table has correct schema
- [ ] Redis: `redis-cli ping` returns `PONG`
- [ ] Spring Boot: `curl http://localhost:8080/infra/health` → `{"status":"UP"}`
- [ ] Spring Boot: `curl http://localhost:8080/infra/redis-check` → `{"redis":"connected"}`
- [ ] Spring Boot: `curl http://localhost:8080/infra/db-check` → `{"mysql":"connected"}`
- [ ] Spring Boot: `curl http://localhost:8080/actuator/health` → `{"status":"UP"}`
- [ ] Node.js: `curl http://localhost:3001/health` → `{"redis":"connected"}`
- [ ] React: `http://localhost:5173` loads without errors
- [ ] React: both health JSONs display on the page
- [ ] React: browser console shows "Socket.IO connected"
- [ ] React: no CORS errors in browser console
- [ ] Cross-Redis: Node.js writes `online:users` → Spring Boot reads it
- [ ] `.env.example` files exist in all three projects (no real `.env` committed)
- [ ] `application.yml` uses env variable substitution (no hardcoded passwords)
- [ ] `.gitignore` excludes `node_modules/`, `target/`, `.env`, `mysql_data/`
- [ ] Git repo has initial commit
- [ ] No service crashes after 2 minutes of idle running

**If any checkbox fails, do NOT proceed to Phase 2. Fix it first.**

---

## 13. Port Map (Local Development)

| Service | Port | URL |
|---|---|---|
| Spring Boot (Auth) | 8080 | `http://localhost:8080` |
| Node.js (Signalling) | 3001 | `http://localhost:3001` |
| React (Frontend) | 5173 | `http://localhost:5173` |
| MySQL | 3306 | `localhost:3306` |
| Redis | 6379 | `localhost:6379` |

---

## 14. Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| Spring Boot fails to start | MySQL not running or wrong credentials | `docker-compose up -d`, check `application.yml` DB env vars |
| `redis-check` returns "disconnected" | Redis not running or wrong host/port | `docker exec -it p2p-redis redis-cli ping`, check Redis config in both projects |
| CORS errors in browser | Origins not whitelisted | Add `http://localhost:5173` to Spring Boot `cors.allowed-origins` and Node.js `CORS_ORIGIN` |
| React can't reach Spring Boot | Wrong URL or Spring Boot not started | Check `VITE_API_BASE_URL` in `.env`, verify `curl http://localhost:8080/infra/health` works |
| Socket.IO not connecting | Node.js not started or CORS mismatch | Check Node.js console, verify `CORS_ORIGIN` includes React origin |
| `schema.sql` not running | `spring.sql.init.mode` not set or JPA `ddl-auto` conflicts | Set `ddl-auto: none` and `init.mode: always` in `application.yml` |
| Port already in use | Another process on 8080/3001/5173 | Kill it: `lsof -i :8080` (Linux/Mac) or `netstat -ano | findstr :8080` (Windows) |

---

## 15. What Phase 1 Does NOT Include

These are explicitly deferred to later phases:

| Feature | Phase |
|---|---|
| User registration endpoint | Phase 2 |
| Login / JWT generation | Phase 2 |
| Online status via Socket.IO events | Phase 2 |
| P2P connection brokering | Phase 3 |
| Chat UI | Phase 4 |
| File transfer | Phase 5 |
| Groups | Phase 6 |
| Group file distribution | Phase 7 |
| Group chat | Phase 8 |

Phase 1 is the **infrastructure layer only**. No user-facing features. No authentication logic. Just services running, connected, and verified.
