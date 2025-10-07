import { RecallrAIError } from "./base";

export class SessionError extends RecallrAIError {
	constructor(message: string, httpStatus: number) {
		super(message, httpStatus);
		this.name = "SessionError";
		Object.setPrototypeOf(this, SessionError.prototype);
	}
}

export class InvalidSessionStateError extends SessionError {
	constructor(message: string, httpStatus: number) {
		super(message, httpStatus);
		this.name = "InvalidSessionStateError";
		Object.setPrototypeOf(this, InvalidSessionStateError.prototype);
	}
}

export class SessionNotFoundError extends SessionError {
	constructor(message: string, httpStatus: number) {
		super(message, httpStatus);
		this.name = "SessionNotFoundError";
		Object.setPrototypeOf(this, SessionNotFoundError.prototype);
	}
}
