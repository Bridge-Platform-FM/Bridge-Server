const express = require('express');
const env_config = require('./configs/env_configs');
const requestResponseLogger = require('./configs/logger');
const HttpResponse = require('./utils/HttpResponse');
const db = require('./models');

const app = express();
app.use(express.json());
app.use(requestResponseLogger);

app.get('/', (req, res) => {
    HttpResponse.success(res, {
        message: 'Hello World!'
    });
});

const SERVER_PORT = env_config.SERVER_PORT || 3000;

app.listen(SERVER_PORT, () => {
    db.sequelize.authenticate()
        .then(() => console.info('Database connected successfully.'))
        .catch(err => console.error('Unable to connect to the database:', err));
    console.info(`Server is running on port http://localhost:${SERVER_PORT}`);
});

module.exports = app;