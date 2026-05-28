class ServiceResponse {
    static success = ({result=[], message='Successfully processed.', statusCode=200}={}) => {
        return {
            success: true,
            result,
            message
        };
    };

    static error = ({message='Error encountered.', result=[], statusCode=500}={}) => {
        return {
            success: false,
            result,
            message
        };
    };
}

module.exports = ServiceResponse;