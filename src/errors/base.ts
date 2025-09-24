/**
 * Base exception class for all RecallrAI SDK exceptions.
 */
export class RecallrAIError extends Error {
    public message: string;
    public httpStatus: number;

    /**
     * Initialize a RecallrAI error.
     *
     * @param message - A human-readable error message.
     * @param httpStatus - The HTTP status code that triggered this error.
     */
    constructor(
        message: string,
        httpStatus: number,
    ) {
        super(message);
        this.name = this.constructor.name;
        this.message = message;
        this.httpStatus = httpStatus;

        // Ensure proper inheritance in Node.js
        Object.setPrototypeOf(this, RecallrAIError.prototype);
    }

    /**
     * Return a string representation of the error.
     */
    toString(): string {
        return `${this.message}. HTTP Status: ${this.httpStatus}.`;
    }
}
