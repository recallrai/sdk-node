import { RecallrAIError } from './base';

/**
 * Raised when there is an authentication issue with the API key.
 * 
 * This exception is typically raised when the API key is invalid,
 * has been revoked, or doesn't have the necessary permissions.
 */
export class AuthenticationError extends RecallrAIError {
    constructor(
        message: string = 'Invalid API key or authentication failed',
        code: string = 'authentication_error',
        httpStatus: number = 401,
        details?: Record<string, any>,
    ) {
        super(message, code, httpStatus, details);
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}
