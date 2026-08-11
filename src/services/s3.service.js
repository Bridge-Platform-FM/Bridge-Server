const { PutObjectCommand, GetObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3 } = require('../configs/aws');
const { BlobSASPermissions } = require('@azure/storage-blob');
const { blobClient } = require('../configs/azureBlob');
const { isAwsServiceEnabled } = require('./adminConfigService');

async function uploadToBucket(
    fileType,
    fileBuffer,
    fileName,
    mimeType,
    companyId,
    userId,
    s3Key
) {
    const useAws = await isAwsServiceEnabled();

    if (useAws) {
        await s3.send(
            new PutObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET,
                Key: s3Key,
                Body: fileBuffer,
                ContentType: mimeType
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
    const useAws = await isAwsServiceEnabled();

    if (useAws) {
        const response = await s3.send(
            new ListObjectsV2Command({
                Bucket: process.env.AWS_S3_BUCKET,
                Prefix: prefix
            })
        );

        return (response.Contents || []).map(file => ({
            key: file.Key,
            fileName: file.Key.split('-').pop(),
            size: file.Size,
            uploadedAt: file.LastModified,
            eTag: file.ETag
        }));
    }

    const files = [];

    for await (const blob of blobClient.listBlobsFlat({ prefix })) {
        files.push({
            key: blob.name,
            fileName: blob.name.split('-').pop(),
            size: blob.properties.contentLength,
            uploadedAt: blob.properties.lastModified,
            eTag: blob.properties.etag
        });
    }

    return files;
}

async function getFileUrl(key) {
    const useAws = await isAwsServiceEnabled();

    if (useAws) {
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key
        });

        const url = await getSignedUrl(
            s3,
            command,
            {
                expiresIn: 180 // 3 minutes
            }
        );

        return url;
    }

    const blockBlobClient = blobClient.getBlockBlobClient(key);

    return blockBlobClient.generateSasUrl({
        permissions: BlobSASPermissions.parse('r'),
        expiresOn: new Date(Date.now() + 180 * 1000) // 3 minutes
    });
}

async function getFileBuffer(key) {
    const useAws = await isAwsServiceEnabled();

    if (useAws) {
        const response = await s3.send(
            new GetObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET,
                Key: key
            })
        );

        const chunks = [];

        for await (const chunk of response.Body) {
            chunks.push(chunk);
        }

        return Buffer.concat(chunks);
    }

    const blockBlobClient = blobClient.getBlockBlobClient(key);

    return blockBlobClient.downloadToBuffer();
}

async function getFileStream(key) {
    const useAws = await isAwsServiceEnabled();

    if (useAws) {
        const response = await s3.send(
            new GetObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET,
                Key: key
            })
        );

        return response.Body;
    }

    const blockBlobClient = blobClient.getBlockBlobClient(key);
    const response = await blockBlobClient.download();

    return response.readableStreamBody;
}

module.exports = {
    uploadToBucket,
    getFileCollection,
    getFileUrl,
    getFileBuffer,
    getFileStream
};