const express = require('express');
const env_config = require('./configs/env_configs');
const requestResponseLogger = require('./middleware/requestResponseLogger');
const errorMiddleware = require('./middleware/errorLogger');
const HttpResponse = require('./utils/HttpResponse');
const db = require('./models');
const authRoutes = require('./routes/authRoutes');

const { testService } = require('./services/testService');



const app = express();
app.use(express.json());

// Application request response logger
app.use(requestResponseLogger);
app.use('/api/v1/auth', authRoutes);

app.get('/', (req, res) => {
    HttpResponse.success(res, {
        message: 'Hello World!'
    });
});

app.get('/error-test', (req, res, next) => {
    try {
        throw new Error('Test Error Logger');
    } catch (error) {
        next(error);
    }
});

app.post('/test-api', async (req, res, next) => {
    try {
        const response = await testService(req.body);
        return res.status(201).json(response);
    } catch (error) {
        next(error);
    }
});


// Error logger middleware
app.use(errorMiddleware);



const SERVER_PORT = env_config.SERVER_PORT || 3000;

app.listen(SERVER_PORT, () => {
    db.sequelize.authenticate()
        .then(() => console.info('Database connected successfully.'))
        .catch(err => console.error('Unable to connect to the database:', err));
    console.info(`Server is running on port http://localhost:${SERVER_PORT}`);
});

module.exports = app;