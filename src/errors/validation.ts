import { RecallrAIError } from './base';

/**
 * Raised when request parameters fail validation.
 * 
 * This exception is raised when the API rejects a request
 * due to invalid or missing parameters.
 */
export class ValidationError extends RecallrAIError {
    constructor(message: string, httpStatus: number) {
        super(message, httpStatus);
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
