const success = ({ result = [], message = 'Successfully processed.' } = {}) => {
    return {
        success: true,
        result,
        message
    };
};

const error = ({ message = 'Error encountered.', result = [] } = {}) => {
    return {
        success: false,
        result,
        message
    };
};

module.exports = {
    success,
    error
};