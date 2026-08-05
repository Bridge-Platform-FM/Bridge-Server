require('dotenv').config();
const { PutObjectCommand, GetObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { s3 } = require("../configs/aws");
const { blobClient } = require('../configs/azureBlob');

async function uploadToBucket(
    fileType,
    fileBuffer,
    fileName,
    mimeType,
    companyId,
    userId,
    s3Key
) {    
    if (process.env.IS_AWS_SERVICE_ACTIVE === 'true') {
        await s3.send(
            new PutObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET,
                Key: s3Key,
                Body: fileBuffer,
                ContentType: mimeType,
                // ServerSideEncryption: "aws:kms",
                // SSEKMSKeyId: process.env.AWS_KMS_KEY_ID
            })
        );
    } else {
        const blockBlobClient = blobClient.getBlockBlobClient(s3Key);
        await blockBlobClient.uploadData(fileBuffer, {
            blobHTTPHeaders: {
                blobContentType: mimeType
            }
        });
    }
    return s3Key;
}

async function getFileCollection(prefix) {

    const response = await s3.send(
        new ListObjectsV2Command({
            Bucket: process.env.AWS_S3_BUCKET,
            Prefix: prefix,
        })
    );

    return (response.Contents || []).map(file => ({
        key: file.Key,
        fileName: file.Key.split("-").pop(),
        size: file.Size,
        uploadedAt: file.LastModified,
        eTag: file.ETag,
    }));
}

async function getFileUrl(key) {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
    });

    const url = await getSignedUrl(
        s3,
        command,
        {
            expiresIn: 180, // 3 minutes
        }
    );

    return url;
}

async function getFileBuffer(key) {

    const response = await s3.send(
        new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
        })
    );

    const chunks = [];

    for await (const chunk of response.Body) {
        chunks.push(chunk);
    }

    return Buffer.concat(chunks);
}

async function getFileStream(key) {

    const response = await s3.send(
        new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
        })
    );

    return response.Body;
}

module.exports = {
    uploadToBucket,
    getFileCollection,
    getFileUrl,
    getFileBuffer,
    getFileStream
};