require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { connectRedis } = require('./config/redis');
const healthRoute = require('./routes/health');

const app = express();
const server = http.createServer(app);

// CORS — allow React dev server origin
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:5173'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express.json());

// Socket.IO server (event handlers added in Phase 2+)
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Phase 2 will add: io.use(jwtAuthMiddleware)
// Phase 2 will add: io.on('connection', (socket) => { ... })

// Health route
app.use('/health', healthRoute);

// Start server
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

module.exports = { app, server, io };
