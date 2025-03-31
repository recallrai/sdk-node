/**
 * Base exception for all RecallrAI SDK errors.
 */
export class RecallrAIError extends Error {
    public code?: string;
    public httpStatus?: number;
    public details?: Record<string, any>;

    /**
     * Initialize a RecallrAI error.
     *
     * @param message - A human-readable error message
     * @param code - An optional error code
     * @param httpStatus - The HTTP status code that triggered this error
     * @param details - Optional additional details about the error
     */
    constructor(
        message: string,
        code?: string,
        httpStatus?: number,
        details?: Record<string, any>,
    ) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.httpStatus = httpStatus;
        this.details = details || {};

        // Ensure proper inheritance in Node.js
        Object.setPrototypeOf(this, RecallrAIError.prototype);
    }

    /**
     * Return a string representation of the error.
     */
    toString(): string {
        return `${this.message}. HTTP Status: ${this.httpStatus}`;
    }
}
