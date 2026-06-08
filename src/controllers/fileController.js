const { errorLogger } = require("../configs/logger");
const { uploadToS3, getFileBuffer } = require("../services/s3.service");
const { scanUploadedFile } = require("../services/scan.service");
const { addPdfWatermark, addImageWatermark } = require("../services/watermark.service");
const { S3_FILE_TYPE } = require("../utils/constant");
const { waterMarkFunction } = require("../utils/Helper");
const HttpResponse = require("../utils/HttpResponse");

// POST /api/v1/file/scan-img & /scan-document
const scanFile = async (req, res, next) => {
    try {
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

        // Upload to S3
        const s3Key = await uploadToS3(
            S3_FILE_TYPE.PROFILE,
            fileBuffer,
            req.file.originalname,
            req.file.mimetype,
            "c_01",
            "u_01"
        )
        console.log("s3Key", s3Key)

        // Store in db
        // id
        // company_id
        // user_id
        // s3_key
        // mime_type
        // file_name

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

//  /api/v1/file/file-preview
const filePreview = async (req, res) => {
    try {
        // get key & id
        // const s3key = req.body.key;
        // const company_id = req.company_id
        // const user_id = req.user_id

        const s3Key = "company/c_01/u_01/profile/1780817395533-Screenshot 2026-05-26 140219.png"
        // const s3Key = 'company/c_01/u_01/profile/1780689222585-Gaurav_Singh.pdf'

        const fileBuffer = await getFileBuffer(s3Key);

        const watermarkText = await waterMarkFunction("c_01", "u_01")
        const watermarkedBuffer = await addImageWatermark(
            fileBuffer,
            watermarkText
        );

        res.setHeader(
            "Content-Type",
            "image/jpeg"
        );

        res.send(watermarkedBuffer);

        // const watermarkedPdf = await addPdfWatermark(fileBuffer, watermarkText);

        // res.setHeader(
        //     "Content-Type",
        //     "application/pdf"
        // );

        // res.send(watermarkedPdf);

        // return HttpResponse.success(res, { fileUrl, statusCode: 200 });
    } catch (error) {
        return HttpResponse.error(res, error);
    }
};

module.exports = { scanFile, filePreview }