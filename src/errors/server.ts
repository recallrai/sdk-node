import { RecallrAIError } from "./base";

export class ServerError extends RecallrAIError {
	constructor(message: string, httpStatus: number) {
		super(message, httpStatus);
		this.name = "ServerError";
		Object.setPrototypeOf(this, ServerError.prototype);
	}
}

export class InternalServerError extends ServerError {
	constructor(message: string, httpStatus: number) {
		super(message, httpStatus);
		this.name = "InternalServerError";
		Object.setPrototypeOf(this, InternalServerError.prototype);
	}
}

export class RateLimitError extends ServerError {
	constructor(message: string, httpStatus: number) {
		super(message, httpStatus);
		this.name = "RateLimitError";
		Object.setPrototypeOf(this, RateLimitError.prototype);
	}
}
