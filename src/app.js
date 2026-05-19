const express = require('express');
const config = require('./configs/configs');
const HttpResponse = require('./utils/HttpResponse');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    HttpResponse.success(res, {
        message: 'Hello World!'
    });
});

const SERVER_PORT = config.SERVER_PORT || 3000;

app.listen(SERVER_PORT, () => {
    console.info(`Server is running on port http://localhost:${SERVER_PORT}`);
});

module.exports = app;