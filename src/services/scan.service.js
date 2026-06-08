const { scanBuffer } = require("../configs/scan");
const ServiceResponse = require("../utils/ServiceResponse");

const scanUploadedFile = async (buffer) => {
    try {
        // Virus Scan
        const result = await scanBuffer(buffer);
        if (result.isInfected) {
            return ServiceResponse.error({
                success: false,
                message: "File is infected with a virus",
                viruses: result.viruses || [],
            });
        }

        return ServiceResponse.success({
            success: true
        });
    } catch (err) {
        return ServiceResponse.error({
            success: false,
            message: "File scan failed",
        });
    }
};

module.exports = {
    scanUploadedFile
}