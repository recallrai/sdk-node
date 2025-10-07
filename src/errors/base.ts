export class RecallrAIError extends Error {
	public readonly httpStatus: number;

	constructor(message: string, httpStatus: number) {
		super(message);
		this.name = "RecallrAIError";
		this.httpStatus = httpStatus;
		Object.setPrototypeOf(this, RecallrAIError.prototype);
	}

	toString(): string {
		return `${this.message}. HTTP Status: ${this.httpStatus}.`;
	}
}
