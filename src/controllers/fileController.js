const { errorLogger } = require("../configs/logger");
const { uploadToS3, getFileBuffer } = require("../services/s3.service");
const { scanUploadedFile } = require("../services/scan.service");
const { addPdfWatermark, addImageWatermark } = require("../services/watermark.service");
const kycService = require('../services/kycService');
const { S3_FILE_TYPE, KYC_DOC_TYPES } = require("../utils/constant");
const { waterMarkFunction } = require("../utils/Helper");
const HttpResponse = require("../utils/HttpResponse");
const { encrypt } = require("../utils/encryption");

// POST /api/v1/file/scan-img & /scan-document
const scanFile = async (req, res, next) => {
    try {
        const userId = req.userId;
        const companyId = req.companyId;
        const companyName = req.companyName;
        const roleId = req.roleId;

        const payload = req.body;
        const docType = payload.docType;
        let side = payload.side || "front";

        if (!req.file) {
            return HttpResponse.error(res, {
                message: "File is required",
                statusCode: 400
            });
        }

        // req.file.buffer
        const fileBuffer = req.file.buffer;
        // Virus Scan
        const scanResult = await scanUploadedFile(fileBuffer);
        if (!scanResult.success) {
            return HttpResponse.error(res, {
                message: scanResult.message,
                statusCode: 400
            });
        }

        let s3_file_type = S3_FILE_TYPE.PROFILE
        if (KYC_DOC_TYPES.includes(docType)) {
            s3_file_type = S3_FILE_TYPE.KYC
        }

        // Upload to S3
        const s3Key = await uploadToS3(
            s3_file_type,
            fileBuffer,
            req.file.originalname,
            req.file.mimetype,
            companyName,
            userId
        )
        console.log("s3Key", s3Key)

        return HttpResponse.success(res, {
            message: "File uploaded successfully",
            data: { 
                fileName: req.file.originalname,
                fileSize: req.file.size,
                mimeType: req.file.mimetype,
                s3Key: s3Key,
                side: side,
                docType: docType
            },
            statusCode: 200
        });

    } catch (error) {
        errorLogger.error(error);
        return HttpResponse.error(res, {
            message: "File upload failed",
            statusCode: 500
        });
    }
}

//  /api/v1/file/file-preview
const filePreview = async (req, res) => {
    try {
        // get key from query
        const { key: s3Key } = req.query;
        const userId = req.userId;
        const companyId = req.companyId;
        const companyName = req.companyName;

        if (!s3Key) {
            return HttpResponse.error(res, {
                message: "File key is required",
                statusCode: 400
            });
        }

        const fileBuffer = await getFileBuffer(s3Key);
        const ext = s3Key.split('.').pop().toLowerCase();

        const mimeTypes = {
            'pdf': 'application/pdf',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'svg': 'image/svg+xml'
        };

        const contentType = mimeTypes[ext] || 'application/octet-stream';
        const watermarkText = await waterMarkFunction(companyName, userId);

        let processedBuffer;
        if (ext === 'pdf') {
            processedBuffer = await addPdfWatermark(fileBuffer, watermarkText);
        } else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
            processedBuffer = await addImageWatermark(
                fileBuffer,
                watermarkText
            );
        } else {
            processedBuffer = fileBuffer;
        }

        res.setHeader("Content-Type", contentType);
        res.setHeader("Content-Disposition", "inline");

        return res.send(processedBuffer)
 
    } catch (error) {
        return HttpResponse.error(res, error);
    }
};

const saveKycInfo = async (req, res) => {
    try {
        const userId = req.userId;
        const companyId = req.companyId;
        const roleId = req.roleId;
        const payload = req.body;

        let data = []
        for(let documentKey in payload) {
            const docData = payload[documentKey]
            const number = docData.number
            const {encryptedData, iv, authTag} = encrypt(number)
            const frontData = docData.front
            const frontS3Key = frontData.s3_key
            const frontMimeType = frontData.mimetype
            const frontFile_name = frontData.file_name
            const frontFileSize = frontData.file_size
            let docDataToStore = {
                user_id: userId,
                company_id: companyId,
                role_id: roleId,
                document_type: documentKey,
                document_number: encryptedData,
                document_number_iv: iv,
                document_number_auth_tag: authTag,
                front_s3_key: frontS3Key,
                front_file_name: frontFile_name,
                front_file_size: frontFileSize,
                front_mime_type: frontMimeType
            }
            if ('back' in docData) {
                const backData = docData.back
                const backS3Key = backData.s3_key
                const backMimeType = backData.mimetype
                const backtFile_name = backData.file_name
                const backFileSize = backData.file_size
                docDataToStore = {
                    ...docDataToStore,
                    back_s3_key: backS3Key,
                    back_file_name: backtFile_name,
                    back_file_size: backFileSize,
                    back_mime_type: backMimeType
                }
            } 
            data.push(docDataToStore)
        }

        const result = await kycService.createKycInfo(data);
        if (!result.success) {
            return HttpResponse.error(res, { message: result.message, statusCode: result.statusCode });
        }

        const s3Key = result.data.records[0].front_s3_key;

        return HttpResponse.success(res, {
            message: "File uploaded successfully",
            data: { s3Key },
            statusCode: 200
        });

    } catch (error) {
        errorLogger.error(error);
        return HttpResponse.error(res, {
            message: "File upload failed",
            statusCode: 500
        });
    }
}

module.exports = { scanFile, filePreview, saveKycInfo }