import { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

function App() {
    const [authHealth, setAuthHealth] = useState(null);
    const [signallingHealth, setSignallingHealth] = useState(null);
    const [socketConnected, setSocketConnected] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check Spring Boot health
        axios
            .get(`${API_BASE}/infra/health`)
            .then((res) => setAuthHealth(res.data))
            .catch((err) => setError(err.message));

        // Check Node.js health
        axios
            .get(`${SOCKET_URL}/health`)
            .then((res) => setSignallingHealth(res.data))
            .catch((err) => setError(err.message));

        // Socket.IO connection test
        const socket = io(SOCKET_URL, {
            transports: ['websocket'],
        });

        socket.on('connect', () => {
            console.log('Socket.IO connected:', socket.id);
            setSocketConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('Socket.IO disconnected');
            setSocketConnected(false);
        });

        socket.on('connect_error', (err) => {
            console.error('Socket.IO connect error:', err.message);
            setSocketConnected(false);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const renderJson = (data) => {
        if (!data) return <p className="loading">Connecting...</p>;
        return (
            <pre className="json">{JSON.stringify(data, null, 2)}</pre>
        );
    };

    return (
        <div className="app">
            <h1>Secure P2P Chat &amp; File Sharing</h1>
            <p className="subtitle">Phase 1 — Infrastructure Status</p>

            {error && (
                <div className="error">
                    <strong>Connection Error:</strong> {error}
                </div>
            )}

            <div className="status-cards">
                <div className="status-card">
                    <h3>Auth Service (Spring Boot)</h3>
                    {renderJson(authHealth)}
                </div>

                <div className="status-card">
                    <h3>Signalling Service (Node.js)</h3>
                    {renderJson(signallingHealth)}
                </div>
            </div>

            <div className="socket-status">
                <h3>Socket.IO Connection</h3>
                <div className={`badge ${socketConnected ? 'badge-ok' : 'badge-warn'}`}>
                    {socketConnected ? 'CONNECTED' : 'DISCONNECTED'}
                </div>
            </div>
        </div>
    );
}

export default App;
