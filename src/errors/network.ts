import { RecallrAIError } from './base';

/**
 * Base class for network-related exceptions.
 * 
 * This exception is raised for errors related to network connectivity
 * and communication with the RecallrAI API.
 */
export class NetworkError extends RecallrAIError {
    constructor(message: string, httpStatus: number) {
        super(message, httpStatus);
        Object.setPrototypeOf(this, NetworkError.prototype);
    }
}

/**
 * Raised when a request times out.
 * 
 * This exception is raised when a request to the RecallrAI API
 * takes longer than the configured timeout.
 */
export class TimeoutError extends NetworkError {
    constructor(message: string, httpStatus: number) {
        super(message, httpStatus);
        Object.setPrototypeOf(this, TimeoutError.prototype);
    }
}

/**
 * Raised when a connection error occurs.
 * 
 * This exception is raised when there's an issue connecting to
 * the RecallrAI API, such as DNS resolution issues or network unavailability.
 */
export class ConnectionError extends NetworkError {
    constructor(message: string, httpStatus: number) {
        super(message, httpStatus);
        Object.setPrototypeOf(this, ConnectionError.prototype);
    }
}
