import { RecallrAIError } from './base';

/**
 * Raised when request parameters fail validation.
 * 
 * This exception is raised when the API rejects a request
 * due to invalid or missing parameters.
 */
export class ValidationError extends RecallrAIError {
    constructor(
        message: string = 'Validation error',
        code: string = 'validation_error',
        httpStatus: number = 422,
        details?: Record<string, any>,
    ) {
        super(message, code, httpStatus, details);
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
