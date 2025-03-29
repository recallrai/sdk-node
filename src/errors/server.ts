import { RecallrAIError } from './base';

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
