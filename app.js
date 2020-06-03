const express = require('express');
const cors = require('cors');
const socketio = require('socket.io');
const http = require('http');
const cookieParser = require('cookie-parser');

const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const globalErrorHandler = require('./controllers/errorController');
const socketioController = require('./controllers/socketioController');
const AppError = require('./utilities/AppError');

const app = express();
const server = http.createServer(app);
const io = socketio.listen(server);

// Use some required middleware
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

// Open socket.io handle listener
io.on('connection', socketioController(io));

// ROUTES middleware
app.get('/', (req, res) => {
    res.status(200).send('Server is running...!');
});

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/chats', chatRoutes);
app.use('/api/v1/messages', messageRoutes);

app.use('*', (req, res, next) => {
    next(new AppError("This url doesn't exist!, 404"));
});

// Error handling middleware
app.use(globalErrorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, err => {
    if (err) {
        console.log(err);
    } else {
        console.log(`App is running at port ${PORT}`);
    }
});
