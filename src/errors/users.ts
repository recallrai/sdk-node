import { RecallrAIError } from './base';

/**
 * Base class for user-related exceptions.
 * 
 * This exception is raised for errors related to user management
 * in the RecallrAI API.
 */
export class UserError extends RecallrAIError {
    constructor(message: string, httpStatus: number) {
        super(message, httpStatus);
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
    constructor(message: string, httpStatus: number) {
        super(message, httpStatus);
        Object.setPrototypeOf(this, UserNotFoundError.prototype);
    }
}

/**
 * Raised when a user already exists.
 * 
 * This exception is typically raised when trying to create a user
 * that already exists in the system.
 */
export class UserAlreadyExistsError extends UserError {
    constructor(message: string, httpStatus: number) {
        super(message, httpStatus);
        Object.setPrototypeOf(this, UserAlreadyExistsError.prototype);
    }
}

/**
 * Raised when invalid categories are provided for user memories.
 * 
 * This exception is typically raised when trying to filter memories
 * by categories that don't exist in the project.
 */
export class InvalidCategoriesError extends UserError {
    constructor(message: string, httpStatus: number) {
        super(message, httpStatus);
        Object.setPrototypeOf(this, InvalidCategoriesError.prototype);
    }
}
