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
    OTP_SEND_SUCCESS: "OTP sent successfully",
    OTP_SEND_FAILED: "failed to send OTP"
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
    LOGIN_FAILED: 'Error encountered while logging in',
    PASSWORD_RESET_SUCCESS: 'Password updated successfully',
    PASSWORD_RESET_FAILED: 'Error encountered while updating password'
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
    USER_NOT_FOUND: 'User not found'
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

const SESSION_MESSAGES = {
    SESSION_LISTING_SUCCESS: 'Active sessions fetched successfully',
    SESSION_LISTING_FAILED: 'Failed to fetch active sessions',
    SESSION_REVOKE_SUCCESS: 'Session revoked successfully',
    SESSION_REVOKE_FAILED: 'Failed to revoke session',
    SESSION_NOT_FOUND: 'Session not found',
    LOGOUT_ALL_SUCCESS: 'All sessions revoked. Please log in again.',
    LOGOUT_ALL_FAILED: 'Failed to revoke all sessions',
    LOGOUT_SUCCESS: 'Logged out successfully',
    LOGOUT_FAILED: 'Failed to log out',
    SESSION_CREATE_SUCCESS: 'Session created successfully',
    SESSION_CREATE_FAILED: 'Failed to create session',
    SESSION_LIMIT_REACHED: 'Maximum number of active devices reached. Please choose a device to log out.',
    SESSION_SELECTION_REQUIRED: 'Please select at least one device to log out.',
    SESSION_SELECTION_INVALID: 'One or more selected sessions are invalid or do not belong to you.',
    LOGOUT_SUCCESS: 'Logged out successfully',
    LOGOUT_FAILED: 'Failed to log out'
}

const S3_FILE_TYPE = {
    PROFILE: 'profile',
    KYC: 'kyc',
    CHAT: 'chat'
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
    USER: ['STARTUP', 'INVESTOR', 'B2B'],
    ADMIN: ['SYS_ADMIN']
};

const TOKEN_TYPES = {
    AUTH_ACCESS_TOKEN: 'AUTH_ACCESS_TOKEN',
    AUTH_REFRESH_ACCESS_TOKEN: 'REFRESH_ACCESS_TOKEN',
    RESET_PASSWORD_ACCESS_TOKEN: 'RESET_PASSWORD_ACCESS_TOKEN'
};

const CONNECTION_VALID_TRANSITIONS = {
    Viewed:    ['Pending'],
    Accepted:  ['Pending', 'Viewed', 'Deferred'],
    Declined:  ['Pending', 'Viewed', 'Deferred'],
    Deferred:  ['Pending', 'Viewed'],
    Withdrawn: ['Pending', 'Viewed', 'Deferred']
};

const CONNECTION_STATUS = {
    PENDING: 'Pending',
    VIEWED: 'Viewed',
    ACCEPTED: 'Accepted',
    DECLINED: 'Declined',
    DEFERRED: 'Deferred',
    WITHDRAWN: 'Withdrawn',
    EXPIRED: 'Expired'
};

const SUBSCRIPTION_MESSAGES = {
    NO_ACTIVE_SUBSCRIPTION: 'Access denied: No active subscription found',
    SUBSCRIPTION_EXPIRED: 'Access denied: Your subscription has expired',
    SUBSCRIPTION_CHECK_FAILED: 'Error encountered while verifying subscription',
    SUBSCRIPTION_FETCH_FAILED: 'Error encountered while fetching subscription',
    SUBSCRIPTION_FETCH_SUCCESS: 'Subscription fetched successfully'
};

const CONNECTION_REQUEST_LIMITS = {
    FREE: 3,
    PREMIUM: 50
};

const CONNECTION_MESSAGES = {
    REQUEST_SENT: 'Connection request sent successfully',
    CONNECTION_LIMIT_REACHED: 'Connection request limit reached for this billing period',
    REQUEST_ACCEPTED: 'Connection request accepted',
    REQUEST_DECLINED: 'Connection request declined',
    REQUEST_DEFERRED: 'Connection request deferred',
    REQUEST_WITHDRAWN: 'Connection request withdrawn',
    REQUEST_VIEWED: 'Connection request marked as viewed',
    ALREADY_EXISTS: 'A connection with this user already exists',
    RECIPIENT_NOT_FOUND: 'Recipient user not found',
    RECIPIENT_ROLE_NOT_FOUND: 'Recipient role not found',
    NOT_FOUND: 'Connection not found',
    FORBIDDEN: 'You are not authorized to perform this action',
    INVALID_TRANSITION: 'This status change is not allowed',
    INVALID_ROLE_PAIR: 'Connection is not allowed between these roles',
    FETCH_SUCCESS: 'Connections fetched successfully',
    FETCH_FAILED: 'Error encountered while fetching connections',
    REQUEST_FAILED: 'Error encountered while sending connection request',
    SENT_FETCH_SUCCESS: 'Sent connection requests fetched successfully',
    SENT_FETCH_FAILED: 'Error encountered while fetching sent connection requests',
    RECEIVED_FETCH_SUCCESS: 'Received connection requests fetched successfully',
    RECEIVED_FETCH_FAILED: 'Error encountered while fetching received connection requests'
};

const DEAL_ROOM_STATUS = {
    ACTIVE: 'Active',
    CLOSED: 'Closed'
};

const DEAL_ROOM_MESSAGES = {
    CREATE_SUCCESS: 'Deal room created successfully',
    CREATE_FAILED: 'Error encountered while creating deal room',
    FETCH_SUCCESS: 'Deal rooms fetched successfully',
    FETCH_FAILED: 'Error encountered while fetching deal rooms',
    CLOSE_SUCCESS: 'Deal room closed successfully',
    CLOSE_FAILED: 'Error encountered while closing deal room',
    ALREADY_CLOSED: 'Deal room is already closed',
    NOT_FOUND: 'Deal room not found',
    FORBIDDEN: 'You are not authorized to perform this action'
};

const CHAT_MESSAGE_TYPE = {
    TEXT: 'TEXT',
    IMAGE: 'IMAGE',
    DOCUMENT: 'DOCUMENT',
    AUDIO: 'AUDIO',
    VIDEO: 'VIDEO'
};

const CHAT_MESSAGES = {
    SEND_SUCCESS: 'Message sent successfully',
    SEND_FAILED: 'Error encountered while sending message',
    FETCH_SUCCESS: 'Messages fetched successfully',
    FETCH_FAILED: 'Error encountered while fetching messages',
    MARK_READ_SUCCESS: 'Messages marked as read',
    MARK_READ_FAILED: 'Error encountered while marking messages as read',
    MEDIA_UPLOAD_SUCCESS: 'Media message sent successfully',
    MEDIA_UPLOAD_FAILED: 'Error encountered while sending media message',
    MEDIA_FETCH_FAILED: 'Error encountered while fetching media',
    MEDIA_REQUIRED: 'Media file is required',
    FILES_FETCH_SUCCESS: 'Shared files fetched successfully',
    FILES_FETCH_FAILED: 'Error encountered while fetching shared files',
    MESSAGE_NOT_FOUND: 'Message not found',
    DEAL_ROOM_NOT_FOUND: 'Deal room not found',
    DEAL_ROOM_CLOSED: 'This deal room is closed; new messages are not allowed',
    FORBIDDEN: 'You are not authorized to access this deal room chat'
};

const SOCKET_EVENTS = {
    JOIN_DEAL_ROOM: 'join_deal_room',
    LEAVE_DEAL_ROOM: 'leave_deal_room',
    SEND_MESSAGE: 'send_message',
    NEW_MESSAGE: 'new_message',
    MARK_READ: 'mark_read',
    MESSAGES_READ: 'messages_read',
    TYPING: 'typing',
    STOP_TYPING: 'stop_typing',
    USER_TYPING: 'user_typing',
    ERROR: 'error'
};

// ─── Meeting ──────────────────────────────────────────────────────────────────

const MEETING_MESSAGES = {
    CREATE_SUCCESS: 'Meeting created successfully',
    CREATE_FAILED: 'Error encountered while creating meeting',
    UPDATE_SUCCESS: 'Meeting updated successfully',
    UPDATE_FAILED: 'Error encountered while updating meeting',
    NOT_FOUND: 'Meeting not found',
    DEAL_ROOM_NOT_FOUND: 'Deal room not found',
    PAST_TIME: 'Meeting time cannot be in the past',
    NOT_DEAL_ROOM_PARTICIPANT: 'You are not a participant in this deal room',
    RECIPIENT_MISMATCH: 'The recipient does not match the deal room participant',
    FETCH_SUCCESS: 'Meetings fetched successfully',
    FETCH_FAILED: 'Error encountered while fetching meetings',
    FORBIDDEN: 'You are not authorized to perform this action'
};

module.exports = { OTP_MESSAGES, REGISTRATION_MESSAGES, AUTH_MESSAGES, ROLE_FIELD_METADATA_MESSAGES,
    USER_MESSAGES, S3_FILE_TYPE, KYC_DOC_TYPES, KYC_MESSAGES,
    ENCRYPT_DECRYPT_MESSAGES, DEFAULT_KYC_VERIFICATION_APPROVAL_TIME,
    KYC_STATUS, CHANNEL_TYPE, LOGIN_MESSAGES, REDIRECT_ROUTES, ADMIN_MESSAGES,
    ROLES, MATCHING_MESSAGES, TOKEN_TYPES, CONNECTION_STATUS, CONNECTION_MESSAGES,
    CONNECTION_VALID_TRANSITIONS, SUBSCRIPTION_MESSAGES, CONNECTION_REQUEST_LIMITS,
    DEAL_ROOM_STATUS, DEAL_ROOM_MESSAGES, CHAT_MESSAGE_TYPE, CHAT_MESSAGES, SOCKET_EVENTS,
    SESSION_MESSAGES, MEETING_MESSAGES
};