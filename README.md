# Secure P2P Chat & File Sharing

A peer-to-peer chat and file sharing application with end-to-end encryption, chunk-based file transfer with resume support, and group file distribution.

## Architecture

- **Spring Boot (Java)** — Auth, DB, REST API, connection brokering
- **Node.js (Express + Socket.IO)** — Signalling, real-time events, online status
- **React (Vite)** — Frontend UI
- **MySQL** — Persistent storage (users, groups, messages metadata)
- **Redis** — Shared online-status store between Spring Boot & Node.js

## Quick Start

```bash
# 1. Start MySQL + Redis
docker-compose up -d

# 2. Start Spring Boot
cd backend-auth
cp .env.example .env       # edit if needed
mvn spring-boot:run

# 3. Start Node.js
cd backend-signalling
cp .env.example .env       # edit if needed
npm install
npm run dev

# 4. Start React
cd frontend
cp .env.example .env       # edit if needed
npm install
npm run dev
```

## Ports

| Service | Port |
|---|---|
| Spring Boot | 8080 |
| Node.js | 3001 |
| React | 5173 |
| MySQL | 3306 |
| Redis | 6379 |
