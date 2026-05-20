const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

const logDir = path.join(process.cwd(), 'logs');

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}


const transport = new DailyRotateFile({
    filename: path.join(logDir, 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: false,
    maxSize: '20m',
    maxFiles: '30d'
});

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.printf((info) => info.message),
    transports: [transport]
});

const requestResponseLogger = (req, res, next) => {

    const startTime = Date.now();

    const originalJson = res.json;
    const originalSend = res.send;

    let responseBody;

    // Capture res.json()
    res.json = function(body) {
        responseBody = body;
        return originalJson.call(this, body);
    };

    // Capture res.send()
    res.send = function(body) {
        responseBody = body;
        return originalSend.call(this, body);
    };

    res.on('finish', () => {

        const endTime = Date.now();
        const timeConsumed = `${endTime - startTime} ms`;

        // Determine log level
        let logLevel = 'info';

        if (res.statusCode >= 500) {
            logLevel = 'error';
        } else if (res.statusCode >= 400) {
            logLevel = 'warn';
        } else if (res.statusCode >= 300) {
            logLevel = 'warn';
        }

        const logMessage =
            `${logLevel.toUpperCase()} - ` +
            `${req.method} - ` +
            `${req.originalUrl} - ` +
            `${res.statusCode} - ` +
            `${timeConsumed} - ` +
            `REQUEST_HEADERS: ${JSON.stringify(req.headers)} - ` +
            `REQUEST_BODY: ${JSON.stringify(req.body)} - ` +
            `RESPONSE_HEADERS: ${JSON.stringify(res.getHeaders())} - ` +
            `RESPONSE_BODY: ${JSON.stringify(responseBody)}`;

        logger.log({
            level: logLevel,
            message: logMessage
        });
    });

    next();
};

module.exports = requestResponseLogger;