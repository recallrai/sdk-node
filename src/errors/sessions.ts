import { RecallrAIError } from './base';

/**
 * Base class for session-related exceptions.
 * 
 * This exception is raised for errors related to session management
 * in the RecallrAI API.
 */
export class SessionError extends RecallrAIError {
    constructor(message: string, httpStatus: number) {
        super(message, httpStatus);
        Object.setPrototypeOf(this, SessionError.prototype);
    }
}

/**
 * Raised when a session is in an invalid state.
 * 
 * This exception is typically raised when trying to perform an action
 * on a session that is not in the expected state.
 */
export class InvalidSessionStateError extends SessionError {
    constructor(message: string, httpStatus: number) {
        super(message, httpStatus);
        Object.setPrototypeOf(this, InvalidSessionStateError.prototype);
    }
}

/**
 * Raised when a session is not found.
 * 
 * This exception is typically raised when trying to access or modify
 * a session that doesn't exist.
 */
export class SessionNotFoundError extends SessionError {
    constructor(message: string, httpStatus: number) {
        super(message, httpStatus);
        Object.setPrototypeOf(this, SessionNotFoundError.prototype);
    }
}
