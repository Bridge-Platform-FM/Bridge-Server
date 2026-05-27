const success = ({ data = [], message = 'Successfully processed.' } = {}) => {
    return {
        success: true,
        data,
        message
    };
};

const error = ({ message = 'Error encountered.', data = [] } = {}) => {
    return {
        success: false,
        data,
        message
    };
};

module.exports = {
    success,
    error
};