import { RecallrAIError } from './base';

/**
 * Base class for user-related exceptions.
 * 
 * This exception is raised for errors related to user management
 * in the RecallrAI API.
 */
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

/**
 * Raised when a user is not found.
 * 
 * This exception is typically raised when trying to access or modify
 * a user that doesn't exist.
 */
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

/**
 * Raised when a user already exists.
 * 
 * This exception is typically raised when trying to create a user
 * that already exists in the system.
 */
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
