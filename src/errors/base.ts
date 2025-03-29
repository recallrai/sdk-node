export class RecallrAIError extends Error {
    public code?: string;
    public httpStatus?: number;
    public details?: Record<string, any>;

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

    toString(): string {
        if (this.code) {
            return `${this.code}: ${this.message}`;
        }
        return this.message;
    }
}
