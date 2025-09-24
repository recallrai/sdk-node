import { RecallrAIError } from './base';

/**
 * Base class for server-related exceptions.
 * 
 * This exception serves as the base for all exceptions related to
 * server-side errors in the RecallrAI API.
 */
export class ServerError extends RecallrAIError {
    constructor(message: string, httpStatus: number) {
        super(message, httpStatus);
        Object.setPrototypeOf(this, ServerError.prototype);
    }
}

/**
 * Raised when the RecallrAI API encounters an internal server error.
 * 
 * This exception is typically raised when the API returns a 5xx error code.
 */
export class InternalServerError extends ServerError {
    constructor(message: string, httpStatus: number) {
        super(message, httpStatus);
        Object.setPrototypeOf(this, InternalServerError.prototype);
    }
}

/**
 * Raised when the API rate limit has been exceeded.
 *
 * This exception is raised when too many requests are made in a
 * short period of time.
 */
export class RateLimitError extends ServerError {
    constructor(message: string, httpStatus: number) {
        super(message, httpStatus);
        Object.setPrototypeOf(this, RateLimitError.prototype);
    }
}
