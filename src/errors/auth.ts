import { RecallrAIError } from "./base";

export class AuthenticationError extends RecallrAIError {
	constructor(message: string = "Invalid API key or authentication failed.", httpStatus: number = 401) {
		super(message, httpStatus);
		this.name = "AuthenticationError";
		Object.setPrototypeOf(this, AuthenticationError.prototype);
	}
}
