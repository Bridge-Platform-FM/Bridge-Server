require('dotenv').config();

const { BlobServiceClient } = require("@azure/storage-blob");

const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING
);

const containerName = process.env.AZURE_CONTAINER_NAME;
const blobClient = blobServiceClient.getContainerClient(containerName);


module.exports = { blobClient };
