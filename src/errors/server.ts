import { RecallrAIError } from './base';

/**
 * Base class for server-related exceptions.
 */
export class ServerError extends RecallrAIError {
    constructor(
        message: string = 'Server error occurred',
        code: string = 'server_error',
        httpStatus: number = 500,
        details?: Record<string, any>,
    ) {
        super(message, code, httpStatus, details);
        Object.setPrototypeOf(this, ServerError.prototype);
    }
}

/**
 * Raised when the RecallrAI API encounters an internal server error.
 * 
 * This exception is typically raised when the API returns a 5xx error code.
 */
export class InternalServerError extends ServerError {
    constructor(
        message: string = 'Internal server error',
        code: string = 'server_error',
        httpStatus: number = 500,
        details?: Record<string, any>,
    ) {
        super(message, code, httpStatus, details);
        Object.setPrototypeOf(this, InternalServerError.prototype);
    }
}

/**
 * Raised when the RecallrAI API rate limits the client.
 * 
 * Typically corresponds to HTTP 429 Too Many Requests.
 */
export class RateLimitError extends ServerError {
    constructor(
        message: string = 'Rate limit exceeded',
        code: string = 'rate_limit',
        httpStatus: number = 429,
        details?: Record<string, any>,
    ) {
        super(message, code, httpStatus, details);
        Object.setPrototypeOf(this, RateLimitError.prototype);
    }
}
