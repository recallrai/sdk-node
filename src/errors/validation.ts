import { RecallrAIError } from "./base";

export class ValidationError extends RecallrAIError {
	constructor(message: string, httpStatus: number) {
		super(message, httpStatus);
		this.name = "ValidationError";
		Object.setPrototypeOf(this, ValidationError.prototype);
	}
}
