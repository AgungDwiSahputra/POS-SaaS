/**
 * Error Handler Utility
 * Provides comprehensive error handling and logging for the application
 */

// Error types for better categorization
export const ErrorTypes = {
    VALIDATION: 'VALIDATION_ERROR',
    NETWORK: 'NETWORK_ERROR',
    AUTHENTICATION: 'AUTHENTICATION_ERROR',
    AUTHORIZATION: 'AUTHORIZATION_ERROR',
    NOT_FOUND: 'NOT_FOUND_ERROR',
    SERVER: 'SERVER_ERROR',
    CLIENT: 'CLIENT_ERROR',
    UNKNOWN: 'UNKNOWN_ERROR'
};

// Error severity levels
export const ErrorSeverity = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL'
};

/**
 * Creates a standardized error object
 * @param {string} message - Error message
 * @param {string} type - Error type from ErrorTypes
 * @param {string} severity - Error severity from ErrorSeverity
 * @param {Object} originalError - Original error object
 * @param {Object} context - Additional context information
 * @returns {Object} Standardized error object
 */
export const createError = (message, type = ErrorTypes.UNKNOWN, severity = ErrorSeverity.MEDIUM, originalError = null, context = {}) => {
    if (!message) {
        message = 'Unknown error occurred';
    }

    const error = {
        id: `ERR_${typeof Date !== 'undefined' ? Date.now() : 0}_${typeof Math !== 'undefined' ? Math.random().toString(36).substr(2, 9) : 'fallback'}`,
        message,
        type: type || ErrorTypes.UNKNOWN,
        severity: severity || ErrorSeverity.MEDIUM,
        timestamp: typeof Date !== 'undefined' ? new Date().toISOString() : new Date().toString(),
        context: context || {},
        stack: originalError?.stack || null,
        originalError: originalError?.message || (typeof originalError === 'string' ? originalError : null) || null
    };

    if (context?.errors) {
        error.errors = context.errors;
    }

    // Log error creation for debugging
    if (typeof console !== 'undefined') {
        console.log('createError - created error:', error);
    }

    return error;
};

/**
 * Logs error with appropriate level
 * @param {Object} error - Standardized error object
 */
export const logError = (error) => {
    if (!error) {
        if (typeof console !== 'undefined') {
            console.error('logError - no error provided');
        }
        return;
    }

    if (typeof error !== 'object') {
        if (typeof console !== 'undefined') {
            console.error('logError - error is not an object:', error);
        }
        return;
    }

    const baseError = {
        message: error.message || 'Unknown error',
        type: error.type || ErrorTypes.UNKNOWN,
        severity: error.severity || ErrorSeverity.MEDIUM,
        timestamp: error.timestamp || new Date().toISOString(),
        id: error.id || `ERR_${Date.now()}`,
        ...error
    };

    const logData = {
        ...baseError,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        url: typeof window !== 'undefined' ? window.location.href : 'Unknown'
    };

    // Add userId and sessionId safely
    try {
        logData.userId = getCurrentUserId();
    } catch (e) {
        logData.userId = null;
    }

    try {
        logData.sessionId = getSessionId();
    } catch (e) {
        logData.sessionId = 'unknown';
    }

    if (typeof console !== 'undefined') {
        switch (error.severity) {
            case ErrorSeverity.CRITICAL:
                console.error('🚨 CRITICAL ERROR:', logData);
                break;
            case ErrorSeverity.HIGH:
                console.error('❌ HIGH SEVERITY ERROR:', logData);
                break;
            case ErrorSeverity.MEDIUM:
                console.warn('⚠️ MEDIUM SEVERITY ERROR:', logData);
                break;
            case ErrorSeverity.LOW:
                console.info('ℹ️ LOW SEVERITY ERROR:', logData);
                break;
            default:
                console.log('📝 ERROR:', logData);
        }
    }

    // Send to error reporting service in production
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production') {
        try {
            reportError(logData);
        } catch (reportError) {
            if (typeof console !== 'undefined') {
                console.error('Failed to report error to external service:', reportError);
            }
        }
    }
};

/**
 * Gets current user ID for error context
 * @returns {string|null} User ID or null if not logged in
 */
const getCurrentUserId = () => {
    try {
        // Get user ID from Redux store or local storage
        if (typeof localStorage === 'undefined') {
            return null;
        }
        const user = localStorage.getItem('user');
        if (!user) {
            return null;
        }

        const parsedUser = JSON.parse(user);
        return parsedUser && parsedUser.id ? parsedUser.id : null;
    } catch (error) {
        if (typeof console !== 'undefined') {
            console.warn('getCurrentUserId - error:', error);
        }
        return null;
    }
};

/**
 * Gets session ID for error tracking
 * @returns {string} Session ID
 */
const getSessionId = () => {
    try {
        if (typeof sessionStorage === 'undefined') {
            return `SESSION_${typeof Date !== 'undefined' ? Date.now() : 0}_${typeof Math !== 'undefined' ? Math.random().toString(36).substr(2, 9) : 'fallback'}`;
        }

        let sessionId = sessionStorage.getItem('sessionId');
        if (!sessionId) {
            sessionId = `SESSION_${typeof Date !== 'undefined' ? Date.now() : 0}_${typeof Math !== 'undefined' ? Math.random().toString(36).substr(2, 9) : 'fallback'}`;
            sessionStorage.setItem('sessionId', sessionId);
        }
        return sessionId;
    } catch (error) {
        if (typeof console !== 'undefined') {
            console.warn('getSessionId - error:', error);
        }
        return `SESSION_${typeof Date !== 'undefined' ? Date.now() : 0}_${typeof Math !== 'undefined' ? Math.random().toString(36).substr(2, 9) : 'fallback'}`;
    }
};

/**
 * Reports error to external service
 * @param {Object} errorData - Error data to report
 */
const reportError = (errorData) => {
    try {
        // Here you can integrate with error reporting services like Sentry, LogRocket, etc.
        // Example: Sentry.captureException(errorData);
        if (typeof console !== 'undefined') {
            console.log('📊 Error reported to external service:', errorData);
        }
    } catch (reportingError) {
        if (typeof console !== 'undefined') {
            console.error('Failed to report error:', reportingError);
        }
        // Don't throw error here to prevent infinite loops
    }
};

/**
 * Handles API errors with proper categorization
 * @param {Object} error - Axios error object
 * @param {string} context - Context where error occurred
 * @returns {Object} Standardized error object
 */
export const handleApiError = (error, context = '') => {
    let message = 'Terjadi kesalahan pada server';
    let type = ErrorTypes.SERVER;
    let severity = ErrorSeverity.HIGH;

    let errors = null;

    console.log('handleApiError - input error:', error);
    console.log('handleApiError - error type:', typeof error);
    console.log('handleApiError - error.response:', error?.response);

    if (error?.response) {
        // Server responded with error status
        const { status, data } = error.response;
        errors = data?.errors || null;

        // Log response data for debugging
        console.log('handleApiError - error.response:', error.response);
        console.log('handleApiError - error.response.data:', data);
        console.log('handleApiError - error.response.status:', status);

        switch (status) {
            case 400:
                type = ErrorTypes.VALIDATION;
                severity = ErrorSeverity.MEDIUM;
                message = data?.message || 'Data yang dikirim tidak valid';
                break;
            case 401:
                type = ErrorTypes.AUTHENTICATION;
                severity = ErrorSeverity.HIGH;
                message = 'Sesi login telah berakhir. Silakan login kembali.';
                break;
            case 403:
                type = ErrorTypes.AUTHORIZATION;
                severity = ErrorSeverity.HIGH;
                message = 'Anda tidak memiliki akses untuk melakukan tindakan ini';
                break;
            case 404:
                type = ErrorTypes.NOT_FOUND;
                severity = ErrorSeverity.MEDIUM;
                message = 'Data yang dicari tidak ditemukan';
                break;
            case 422:
                type = ErrorTypes.VALIDATION;
                severity = ErrorSeverity.MEDIUM;
                message = data?.message || 'Validasi gagal';
                break;
            case 500:
                type = ErrorTypes.SERVER;
                severity = ErrorSeverity.CRITICAL;
                message = 'Terjadi kesalahan internal server';
                break;
            default:
                message = data?.message || `Server error: ${status}`;
        }
    } else if (error?.request) {
        // Network error
        type = ErrorTypes.NETWORK;
        severity = ErrorSeverity.HIGH;
        message = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
    } else {
        // Other error
        type = ErrorTypes.CLIENT;
        severity = ErrorSeverity.MEDIUM;
        message = error?.message || 'Terjadi kesalahan pada aplikasi';
    }

    return createError(
        `${context}: ${message}`,
        type,
        severity,
        error,
        {
            status: error?.response?.status,
            url: error?.config?.url,
            method: error?.config?.method,
            context,
            errors
        }
    );
};

/**
 * Handles JavaScript runtime errors
 * @param {Error} error - JavaScript error object
 * @param {string} context - Context where error occurred
 * @returns {Object} Standardized error object
 */
export const handleRuntimeError = (error, context = '') => {
    let type = ErrorTypes.CLIENT;
    let severity = ErrorSeverity.HIGH;
    let message = error?.message || 'Unknown runtime error';

    // Categorize common JavaScript errors
    if (message.includes('is not a function')) {
        message = `Function tidak ditemukan: ${message}`;
        type = ErrorTypes.CLIENT;
    } else if (message.includes('is not defined')) {
        message = `Variable tidak didefinisikan: ${message}`;
        type = ErrorTypes.CLIENT;
    } else if (message.includes('Cannot read propert')) {
        message = `Property tidak dapat diakses: ${message}`;
        type = ErrorTypes.CLIENT;
    } else if (message.includes('NetworkError') || message.includes('fetch')) {
        type = ErrorTypes.NETWORK;
        message = 'Kesalahan koneksi jaringan';
    }

    return createError(
        `${context}: ${message}`,
        type,
        severity,
        error,
        { context, url: typeof window !== 'undefined' ? window.location.href : 'Unknown' }
    );
};

/**
 * Safe function wrapper that catches and handles errors
 * @param {Function} fn - Function to wrap
 * @param {string} context - Context for error logging
 * @returns {Function} Wrapped function
 */
export const safeCall = (fn, context = '') => {
    if (typeof fn !== 'function') {
        throw createError(
            `${context}: Expected function, got ${typeof fn}`,
            ErrorTypes.VALIDATION,
            ErrorSeverity.HIGH,
            null,
            { context, expectedType: 'function', actualType: typeof fn }
        );
    }

    return (...args) => {
        try {
            return fn(...args);
        } catch (error) {
            const standardizedError = handleRuntimeError(error, context);
            throw standardizedError;
        }
    };
};

/**
 * Validates data type and throws descriptive error if invalid
 * @param {*} data - Data to validate
 * @param {string} expectedType - Expected type ('array', 'object', 'string', etc.)
 * @param {string} context - Context for error message
 * @throws {Object} Standardized error if validation fails
 */
export const validateDataType = (data, expectedType, context = '') => {
    if (data === undefined || data === null) {
        throw createError(
            `${context}: Data is ${data === null ? 'null' : 'undefined'}`,
            ErrorTypes.VALIDATION,
            ErrorSeverity.HIGH,
            null,
            { expectedType, actualType: data === null ? 'null' : 'undefined', context }
        );
    }

    let isValid = false;
    let actualType = typeof data;

    switch (expectedType) {
        case 'array':
            isValid = Array.isArray(data);
            actualType = Array.isArray(data) ? 'array' : typeof data;
            break;
        case 'object':
            isValid = data !== null && typeof data === 'object' && !Array.isArray(data);
            actualType = data !== null && typeof data === 'object' && !Array.isArray(data) ? 'object' : typeof data;
            break;
        case 'string':
            isValid = typeof data === 'string';
            break;
        case 'number':
            isValid = typeof data === 'number' && !isNaN(data);
            break;
        case 'boolean':
            isValid = typeof data === 'boolean';
            break;
        case 'function':
            isValid = typeof data === 'function';
            break;
        default:
            isValid = true; // Skip validation for unknown types
    }

    if (!isValid) {
        throw createError(
            `${context}: Expected ${expectedType}, got ${actualType}`,
            ErrorTypes.VALIDATION,
            ErrorSeverity.HIGH,
            null,
            { expectedType, actualType, context, dataType: typeof data, isArray: Array.isArray(data) }
        );
    }

    return true;
};

/**
 * Formats error for display to user
 * @param {Object} error - Standardized error object
 * @returns {string} User-friendly error message
 */
export const formatErrorForUser = (error) => {
    if (!error) {
        return 'Terjadi kesalahan';
    }

    const typeMessages = {
        [ErrorTypes.VALIDATION]: 'Data yang Anda masukkan tidak valid',
        [ErrorTypes.NETWORK]: 'Masalah koneksi internet',
        [ErrorTypes.AUTHENTICATION]: 'Sesi login berakhir',
        [ErrorTypes.AUTHORIZATION]: 'Akses ditolak',
        [ErrorTypes.NOT_FOUND]: 'Data tidak ditemukan',
        [ErrorTypes.SERVER]: 'Masalah server internal',
        [ErrorTypes.CLIENT]: 'Kesalahan aplikasi',
        [ErrorTypes.UNKNOWN]: 'Kesalahan tidak diketahui'
    };

    return typeMessages[error?.type] || error?.message || 'Terjadi kesalahan';
};

/**
 * Error boundary helper for React components
 * @param {Error} error - React error
 * @param {Object} errorInfo - React error info
 * @returns {Object} Standardized error object
 */
export const handleReactError = (error, errorInfo) => {
    return createError(
        `React Component Error: ${error?.message || 'Unknown error'}`,
        ErrorTypes.CLIENT,
        ErrorSeverity.CRITICAL,
        error,
        {
            componentStack: errorInfo?.componentStack,
            url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
            reactError: true
        }
    );
};
