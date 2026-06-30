const express = require('express');
// uat
// require('dotenv').config({
//   path: '.env.uat'
// });
// local
require('dotenv').config()
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const env_config = require('./configs/env_configs');
const requestResponseLogger = require('./middleware/requestResponseLogger');
const errorMiddleware = require('./middleware/errorLogger');
const HttpResponse = require('./utils/HttpResponse');
const db = require('./models');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const fileRoutes = require('./routes/fileRoutes');
const adminRoutes = require('./routes/adminRoutes');
const matchingRoutes = require('./routes/matchingRoutes');
const connectionRoutes = require('./routes/connectionRoutes');
const dealRoomRoutes = require('./routes/dealRoomRoutes');
const chatRoutes = require('./routes/chatRoutes');
const scanErrorMiddleware = require('./middleware/scanError');
const { initSockets } = require('./sockets');                          // from develop
const userSessionRoutes = require('./routes/userSessionRoutes');        // from our branch

const app = express();
app.use(cors());
app.use(express.json());

// Application request response logger
app.use(requestResponseLogger);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/file', fileRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/matching', matchingRoutes);
app.use('/api/v1/connections', connectionRoutes);
app.use('/api/v1/deal-rooms', dealRoomRoutes);
app.use('/api/v1/deal-rooms/:dealRoomId/messages', chatRoutes);        // from develop
app.use('/api/v1/sessions', userSessionRoutes);                        // from our branch

app.get('/', (req, res) => {
    return HttpResponse.success(res, {
        message: 'Hello World!'
    });
});

// middleware
app.use(errorMiddleware);
app.use(scanErrorMiddleware);

const SERVER_PORT = env_config.SERVER_PORT || 3001;

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
initSockets(io);

server.listen(SERVER_PORT, () => {
    db.sequelize.authenticate()
        .then(() => console.info('Database connected successfully.'))
        .catch(err => console.error('Unable to connect to the database:', err));
    console.info(`Server is running on port http://localhost:${SERVER_PORT}`);
});

module.exports = app;