const io = require('socket.io-client');
const socket = io('http://localhost:8000');

// Listen for the test event
socket.on('testEvent', (data) => {
    console.log('Received testEvent:', data);
});

// Emit a test event to verify connectivity
socket.emit('testEvent', { test: 'Test message from client' });