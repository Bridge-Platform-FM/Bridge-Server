const multer = require("multer");
const NodeClam = require("clamscan");
const fs = require("fs/promises");
const path = require("path");
const os = require("os");

let scanner;
async function initScanner() {
    if (scanner) {
        return scanner;
    }

    scanner = await new NodeClam().init({
        clamdscan: {
            host: "localhost",
            port: 3310,
        },
    });

    return scanner;
}

const picUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            "image/png",
            "image/jpeg"
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            return cb(null, true);
        }
        return cb(
            new Error("Only PNG and JPEG images are allowed"),
            false
        );
    }
});

const fileUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            "application/pdf",
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            return cb(null, true);
        }
        return cb(
            new Error("Only PDF files are allowed"),
            false
        );
    }
});

async function scanBuffer(buffer) {
    const clam = await initScanner();
    const tempFilePath = path.join(
        os.tmpdir(),
        `scan-${Date.now()}`
    );

    try {
        await fs.writeFile(
            tempFilePath,
            buffer
        );
        const result = await clam.isInfected(tempFilePath);
        return result;
    } finally {
        await fs.unlink(
            tempFilePath
        ).catch(() => {});
    }
}

module.exports = {
    picUpload,
    fileUpload,
    scanBuffer
};