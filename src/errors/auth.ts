import { RecallrAIError } from './base';

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
