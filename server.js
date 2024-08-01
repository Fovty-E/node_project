require('dotenv').config();
const express =  require('express')
const app = express()
const csurf = require('csurf')
const path = require('path')
const cors =  require('cors')
const corsOptions = require('./config/corsOptions')
const { logger } = require('./middleware/logEvents')
const errorHandler = require('./middleware/errorHandler')
const verifyJWT = require('./middleware/verifyJWT')
const cookieParser = require('cookie-parser')
const credentials = require('./middleware/credentials')
const mongoose = require('mongoose')
const connectDB = require('./config/dbConn')
const PORT = process.env.PORT || 8000;


// Connect to MongoDB
connectDB()

//custom middleware logger
app.use(logger)
//Cross Origin Resource Sharing

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials)

app.use(cors(corsOptions))
// built-in middleware to handle urlencoded data
app.use(express.urlencoded({ extended: false }));

// built-in middleware to handle json data
app.use(express.json())

//middleware for cookies
app.use(cookieParser())

// Serve static files
app.use(express.static(path.join(__dirname, '/public')))
app.use('/subdir', express.static(path.join(__dirname, '/public')))

app.use('/', require('./routes/root'))
app.use('/register', require('./routes/register'))
app.use('/auth', require('./routes/auth'))
app.use('/refresh', require('./routes/refresh'))
app.use('/logout', require('./routes/logout'))

app.use('/dashboard', require('./routes/user'))

app.use(verifyJWT);
app.use('/api/user', require('./routes/api/user'))
app.use('/subdir', require('./routes/subdir'))
app.use('/employees', require('./routes/api/employees'))



app.all('*', (req, res) => {
    res.status(404);
    if(req.accepts('html')){
        res.sendFile(path.join( __dirname, 'views','404.html'));
    } else if(req.accepts('json')){
        res.json({err: "404 Not Found"});
    } else {
        res.type('txt').send("404 Not Found")
    }
})

app.use(errorHandler)
mongoose.connection.once('open', ()=>{
    console.log('Connected to MongoDB')
    app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));
})





