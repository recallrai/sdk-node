import { RecallrAIError } from './base';

export class NetworkError extends RecallrAIError {
    constructor(
        message: string = 'Network error occurred',
        code: string = 'network_error',
        httpStatus?: number,
        details?: Record<string, any>,
    ) {
        super(message, code, httpStatus, details);
        Object.setPrototypeOf(this, NetworkError.prototype);
    }
}

export class TimeoutError extends NetworkError {
    constructor(
        message: string = 'Request timed out',
        code: string = 'timeout',
        details?: Record<string, any>,
    ) {
        super(message, code, undefined, details);
        Object.setPrototypeOf(this, TimeoutError.prototype);
    }
}

export class ConnectionError extends NetworkError {
    constructor(
        message: string = 'Failed to connect to the RecallrAI API',
        code: string = 'connection_error',
        details?: Record<string, any>,
    ) {
        super(message, code, undefined, details);
        Object.setPrototypeOf(this, ConnectionError.prototype);
    }
}
