import { RecallrAIError } from './base';

/**
 * Base class for session-related exceptions.
 * 
 * This exception is raised for errors related to session management
 * in the RecallrAI API.
 */
export class SessionError extends RecallrAIError {
    constructor(
        message: string = 'Session error occurred',
        code: string = 'session_error',
        httpStatus?: number,
        details?: Record<string, any>,
    ) {
        super(message, code, httpStatus, details);
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
    constructor(
        message: string = 'Invalid session state',
        code: string = 'invalid_session_state',
        httpStatus: number = 400,
        details?: Record<string, any>,
    ) {
        super(message, code, httpStatus, details);
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
    public sessionId?: string;

    constructor(
        sessionId?: string,
        message?: string,
        code: string = 'session_not_found',
        httpStatus: number = 404,
        details?: Record<string, any>,
    ) {
        const errorMessage = message || `Session${sessionId ? ` ${sessionId}` : ''} not found`;
        super(errorMessage, code, httpStatus, details);
        Object.setPrototypeOf(this, SessionNotFoundError.prototype);
        this.sessionId = sessionId;
    }
}
