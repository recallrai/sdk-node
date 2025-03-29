import { RecallrAIError } from './base';

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
