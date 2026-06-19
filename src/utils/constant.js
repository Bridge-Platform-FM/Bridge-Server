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
    TOKEN_REFRESH_FAILED: 'Error encountered while refreshing token',
    LOGIN_SUCCESS: 'Login successful',
    LOGIN_FAILED: 'Error encountered while logging in'
}

const ROLE_FIELD_METADATA_MESSAGES = {
    CREATE_SUCCESS: 'Role field metadata created successfully',
    UPDATE_SUCCESS: 'Role field metadata updated successfully',
    DELETE_SUCCESS: 'Role field metadata deleted successfully',
    NOT_FOUND: 'Role field metadata not found',
    DUPLICATE_FIELD: 'Field already exists for this role and source table',
    INVALID_ROLE: 'Specified role does not exist',
    FETCH_FAILED: 'Error encountered while fetching role field metadata',
    CREATE_FAILED: 'Error encountered while creating role field metadata',
    UPDATE_FAILED: 'Error encountered while updating role field metadata',
    DELETE_FAILED: 'Error encountered while deleting role field metadata'
};

const USER_MESSAGES = {
    CREATE_SUCCESS: 'User profile created successfully',
    CREATE_FAILED: 'Error encountered while creating user profile',
    UPDATE_SUCCESS: 'User profile updated successfully',
    UPDATE_FAILED: 'Error encountered while updating user profile',
    EMAIL_ALREADY_EXISTS: 'A user with this email already exists',
    ROLE_NOT_FOUND: 'Company role not found for this account',
    VALIDATION_FAILED: 'Validation failed for the submitted fields',
    USER_LISTING_FAILURE: 'Error encountered while fetching user list',
    USER_LISTING_SUCCESS: 'User list fetched successfully',
};

const LOGIN_MESSAGES = {
    INVALID_CREDENTIALS: 'Invalid Credentials',
    VALID_CREDENTIALS: 'Logged in successfully',
    USER_NOT_FOUND: 'User not found'
}

const KYC_MESSAGES = {
    FETCH_SUCCESS: 'Fetched KYC documents successfully',
    FETCH_FAILED: 'Error encountered while fetching KYC documents',
    KYC_LISTING_SUCCESS: 'KYC documents fetched successfully',
    KYC_LISTING_FAILED: 'Error encountered while fetching KYC documents',
    DOCUMENT_ACTION_SUCCESS: 'KYC document status updated successfully',
    DOCUMENT_ACTION_FAILED: 'Error encountered while updating KYC document status',
    REVIEW_ACTION_SUCCESS: 'KYC review status updated successfully',
    REVIEW_ACTION_FAILED: 'Error encountered while updating KYC review status',
    DOCUMENT_NOT_FOUND: 'KYC document not found',
}

const ENCRYPT_DECRYPT_MESSAGES = {
    ENCRYPT_FAILED: 'Error encountered while encrypting data',
    DECRYPT_FAILED: 'Error encountered while decrypting data',
    ENCRYPT_SUCCESS: 'Data encrypted successfully',
    DECRYPT_SUCCESS: 'Data decrypted successfully'
}

const ADMIN_MESSAGES = {
    INVALID_CREDENTIALS: 'Invalid Credentials',
    LOGIN_SUCCESS: 'Logged in successfully',
    LOGIN_FAILED: 'Error encountered while logging in'
}

const MATCHING_MESSAGES = {
    MATCH_SUCCESS: 'Matches retrieved successfully',
    MATCH_FAILED: 'Error encountered while retrieving matches',
    PROFILE_NOT_FOUND: 'Profile not found',
    NO_MATCHES_FOUND: 'No matching profiles found'
};

const S3_FILE_TYPE = {
    PROFILE: 'profile',
    KYC: 'kyc'
}

const CHANNEL_TYPE = {
    EMAIL: 'EMAIL',
    PHONE: 'PHONE'
}

const KYC_DOC_TYPES = ['AADHAR', 'PAN'];

const DEFAULT_KYC_VERIFICATION_APPROVAL_TIME = 24;

const KYC_STATUS = {
    PENDING: 'Pending',
    REJECTED: 'Rejected',
    APPROVED: 'Approved'
}

const REDIRECT_ROUTES = {
    REGISTRATION: {
        COMPANY_REGISTRATION: '/registration',
        VERIFY_COMPANY_ACCOUNT: '/registration/verify-account',
        BUILD_USER_PROFILE: '/registration/complete-profile',
        UPLOAD_KYC_DOCUMENTS: '/registration/document-upload',
        PENDING_KYC_APPROVAL: '/registration/verification-status',
    },
    DASHBOARD: {
        DASHBOARD: '/dashboard'
    }
}

const ROLES = {
    user: ['STARTUP', 'INVESTOR', 'B2B'],
    ADMIN: ['SYS_ADMIN']
}

module.exports = { OTP_MESSAGES, REGISTRATION_MESSAGES, AUTH_MESSAGES, ROLE_FIELD_METADATA_MESSAGES, 
    USER_MESSAGES, S3_FILE_TYPE, KYC_DOC_TYPES, KYC_MESSAGES,  
    ENCRYPT_DECRYPT_MESSAGES, DEFAULT_KYC_VERIFICATION_APPROVAL_TIME, 
    KYC_STATUS, CHANNEL_TYPE, LOGIN_MESSAGES, REDIRECT_ROUTES, ADMIN_MESSAGES,
    ROLES, MATCHING_MESSAGES
 };

