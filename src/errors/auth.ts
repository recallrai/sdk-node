import { RecallrAIError } from './base';

/**
 * Raised when there is an authentication issue with the API key.
 * 
 * This exception is typically raised when the API key is invalid,
 * has been revoked, or doesn't have the necessary permissions.
 */
export class AuthenticationError extends RecallrAIError {
    constructor(
        message: string = "Invalid API key or authentication failed.",
        httpStatus: number = 401,
    ) {
        super(message, httpStatus);
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}
