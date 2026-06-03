const OTP_MESSAGES = {
    SUCCESS: 'OTP is sent over email and phone number',
    EMAIL_VALIDATION_FAILED: 'Invalid email format',
    PHONE_NUMBER_VALIDATION_FAILED: 'Invalid phone number format',
    BLOCKED: "Too many attempts. Blocked for 1 hour",
    RESEND_TIMER: "Please wait 60 seconds before resend",
    MAX_RESEND: "Maximum resend attempts reached",
    OTP_GENERATION_FAILED: 'Error encountered while generating and sending OTP.',
    OTP_VERIFICATION_FAILED: 'Error encountered while verifying OTP.',
    OTP_VERIFY_SUCCESS: "OTP verified successfully",
    OTP_SEND_SUCCESS: "OTP sent successfully"
};

const REGISTRATION_MESSAGES = {
    COMPANY_CREATION_FAILED: 'Error encountered while creating company.',
    REGISTRATION_SUCCESS: 'Registration successful'
};

const AUTH_MESSAGES = {
    ACCESS_TOKEN_UNAUTHORIZED: 'Unauthorized: No access token provided',
    FORBIDDEN: 'Forbidden',
    INVALID_CREDENTIALS: 'Invalid email or password',
    ACCESS_TOKEN_EXPIRED: 'Unauthorized: Access token has expired',
    UNAUTHORIZED: 'Unauthorized',
    TOKEN_REFRESH_SUCCESS: 'Token refreshed successfully',
    TOKEN_REFRESH_FAILED: 'Error encountered while refreshing token'
    
}

module.exports = { OTP_MESSAGES, REGISTRATION_MESSAGES, AUTH_MESSAGES };