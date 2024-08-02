require('dotenv').config();
const express = require('express');
const session = require('express-session');
const csurf = require('csurf');
const path = require('path');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const verifyJWT = require('./middleware/verifyJWT');
const authenticateSocket = require('./middleware/authenticateSocket');
const cookieParser = require('cookie-parser');
const credentials = require('./middleware/credentials');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const PORT = process.env.PORT || 8000;
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// In-memory store for online users
const onlineUsers = new Map();

// Connect to MongoDB
connectDB();

// Custom middleware logger
app.use(logger);

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// Built-in middleware to handle URL-encoded data
app.use(express.urlencoded({ extended: false }));

// Built-in middleware to handle JSON data
app.use(express.json());

// Middleware for cookies
app.use(cookieParser());

// Serve static files
app.use(express.static(path.join(__dirname, '/public')));

// Authentication middleware for Socket.IO connections




// Routes
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use('/', require('./routes/root'));
app.use('/register', require('./routes/register'));
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});
app.use('/auth', require('./routes/auth'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));
app.use('/dashboard', require('./routes/user'));
app.use('/api', require('./routes/api/user'));
app.use('/subdir', require('./routes/subdir'));
app.use('/employees', require('./routes/api/employees'));

app.use(verifyJWT);
// Middleware to authenticate socket connections
io.use(authenticateSocket);
io.on('connection', (socket,req) => {
    console.log('User has connected');
    // Get user ID from socket handshake query
    const userId = socket.userId
    console.log(userId)
    if (userId) {
      onlineUsers.set(userId, socket.id);
      io.emit('userStatus', { userId, online: true });
    }
  
    socket.on('join', (conversationId) => {
      socket.join(conversationId);
    });
  
    socket.on('disconnect', () => {
      console.log('User disconnected');
      if (userId) {
        onlineUsers.delete(userId);
        io.emit('userStatus', { userId, online: false });
      }
    });
  });
app.all('*', (req, res) => {
  res.status(404);
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html'));
  } else if (req.accepts('json')) {
    res.json({ err: "404 Not Found" });
  } else {
    res.type('txt').send("404 Not Found");
  }
});

app.use(errorHandler);

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
