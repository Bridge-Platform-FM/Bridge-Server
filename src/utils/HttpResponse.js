class HttpResponse {
    static success(res, {result = [], message = 'Successfully processed.', statusCode = 200} = {}) {

        return res.status(statusCode).json({
            success: true,
            result,
            message
        });
    }

    static error(res, {message = 'Error encountered.', statusCode = 500, result = [], errorCode = 'ERR_001'} = {}) {

        return res.status(statusCode).json({
            success: false,
            error_code: errorCode,
            result,
            message
        });
    }
}

module.exports = HttpResponse;