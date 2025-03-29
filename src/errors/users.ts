import { RecallrAIError } from './base';

export class UserError extends RecallrAIError {
    constructor(
        message: string = 'User error occurred',
        code: string = 'user_error',
        httpStatus?: number,
        details?: Record<string, any>,
    ) {
        super(message, code, httpStatus, details);
        Object.setPrototypeOf(this, UserError.prototype);
    }
}

export class UserNotFoundError extends UserError {
    public userId?: string;

    constructor(
        userId?: string,
        message?: string,
        code: string = 'user_not_found',
        httpStatus: number = 404,
        details?: Record<string, any>,
    ) {
        const errorMessage = message || `User${userId ? ` ${userId}` : ''} not found`;
        super(errorMessage, code, httpStatus, details);
        Object.setPrototypeOf(this, UserNotFoundError.prototype);
        this.userId = userId;
    }
}

export class UserAlreadyExistsError extends UserError {
    public userId?: string;

    constructor(
        userId?: string,
        message?: string,
        code: string = 'user_already_exists',
        httpStatus: number = 409,
        details?: Record<string, any>,
    ) {
        const errorMessage = message || `User${userId ? ` ${userId}` : ''} already exists`;
        super(errorMessage, code, httpStatus, details);
        Object.setPrototypeOf(this, UserAlreadyExistsError.prototype);
        this.userId = userId;
    }
}
