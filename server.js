require('dotenv').config();
const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
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
const db = require('./model')
const PORT = process.env.PORT || 8000;
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// In-memory store for online users
const onlineUsers = new Map();


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


// Initialize session store
const sessionStoreInstance = new SequelizeStore({
  db: db.sequelize,
});
sessionStoreInstance.sync(); // Sync session store

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStoreInstance,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
}));

// Share session middleware with Socket.IO
const sharedSession = require('express-socket.io-session');
io.use(sharedSession(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStoreInstance,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
}), {
  autoSave: true
}));


app.use('/', require('./routes/root'));
app.use('/register', require('./routes/register'));
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});
app.use('/dashboard', require('./routes/user'));

app.use('/auth', require('./routes/auth'));
app.use(verifyJWT);

app.use((req, res, next) => {
    req.io = io;
    next();
});
// Middleware to authenticate socket connections
io.use(authenticateSocket);

io.on('connection', (socket) => {
  socket.on('getUsersInConversation', (conversationId, callback) => {
    const room = io.sockets.adapter.rooms.get(conversationId);

    if (room) {
        // Convert Set to an array of socket IDs
        const usersInRoom = Array.from(room);

        // Optionally, retrieve additional information like userIds
        const userIds = usersInRoom.map(socketId => {
            return io.sockets.sockets.get(socketId).userId;
        });

        // Send the list of users to the client
        callback(userIds);
    } else {
        callback([]);
    }
});
    // Get user ID from socket handshake query
    const userId = socket.userId
    console.log('User '+userId+' has connected');
    socket.on('userOnline', (userId) => {
        onlineUsers.set(userId, socket.id);
        // Send to other users that newly connected user is online
        socket.broadcast.emit('userStatus', { userId, online: true });
        // Send current online users to the newly connected user
        onlineUsers.forEach((socketId, onlineUserId) => {
            if (onlineUserId !== userId) {
                socket.emit('userStatus', { userId: onlineUserId, online: true });
            }
        });
    });
    
    socket.on('sendMessage', async(data) => {
        const {sendMessage} = require('./controllers/userController')
        await sendMessage(data, socket, userId);
        
    })
    socket.on('join', (conversationId) => {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined room ${conversationId}`);
    });
    console.log(onlineUsers)
        console.log('socket ' + socket.id)
    socket.on('disconnect', () => {
        
        const userId = [...onlineUsers].find(([key, value]) => value === socket.id);
        console.log('dd'+userId)
        if(userId){
            onlineUsers.delete(userId[0]);
            // Broadcast this user's offline status to all other users
            io.emit('userStatus', { userId:userId[0], online: false });
            console.log('A user disconnected');
        }
        
        
    });
   
  });
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));

app.use('/api', require('./routes/api/user'));
app.use('/subdir', require('./routes/subdir'));
app.use('/employees', require('./routes/api/employees'));



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

db.sequelize.sync({force: false}).then(() => {
    console.log('Database synced');
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
})
// require("crypto").randomBytes(64).toString("hex")