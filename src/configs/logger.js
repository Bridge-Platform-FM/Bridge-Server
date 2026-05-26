const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

const logDir = path.join(process.cwd(), 'logs');

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Daily rotate file transport
// const transport = new DailyRotateFile({
//     filename: path.join(logDir, 'application-%DATE%.log'),
//     datePattern: 'YYYY-MM-DD',
//     zippedArchive: false,
//     maxSize: '20m',
//     maxFiles: '30d'
// });

//application request response logger

const applicationTransport = new DailyRotateFile({
    filename: path.join(logDir, 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: false,
    maxSize: '20m',
    maxFiles: '30d'
});

const applicationLogger = winston.createLogger({
    level: 'info',
    format: winston.format.printf((info) => info.message),
    transports: [applicationTransport]
});



// const logger = winston.createLogger({
//     level: 'info',
//     format: winston.format.printf((info) => info.message),
//     transports: [transport]
// });

// log formate chnage 

// const logger = winston.createLogger({
//     level: 'info',
//     format: winston.format.combine(
//         winston.format.timestamp(),
//         winston.format.json()
//     ),
//     transports: [transport]
// });

// module.exports = logger;


//error logger

const errorTransport = new DailyRotateFile({
    filename: path.join(logDir, 'errorlog-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: false,
    maxSize: '20m',
    maxFiles: '30d'
});

const errorLogger = winston.createLogger({
    level: 'error',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, message }) => {
            return `${timestamp} - ${message}`;
        })
    ),
    transports: [errorTransport]
});

module.exports = {
    applicationLogger,
    errorLogger
};

