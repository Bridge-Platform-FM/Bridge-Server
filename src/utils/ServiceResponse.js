class ServiceResponse {
    static success = ({result=[], message='Successfully processed.'}={}) => {
        return {
            success: true,
            result,
            message
        };
    };

    static error = ({message='Error encountered.', result=[]}={}) => {
        return {
            success: false,
            result,
            message
        };
    };
}

module.exports = ServiceResponse;