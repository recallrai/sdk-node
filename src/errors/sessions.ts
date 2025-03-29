import { RecallrAIError } from './base';

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
