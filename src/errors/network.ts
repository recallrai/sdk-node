import { RecallrAIError } from "./base";

export class NetworkError extends RecallrAIError {
	constructor(message: string, httpStatus: number) {
		super(message, httpStatus);
		this.name = "NetworkError";
		Object.setPrototypeOf(this, NetworkError.prototype);
	}
}

export class TimeoutError extends NetworkError {
	constructor(message: string, httpStatus: number) {
		super(message, httpStatus);
		this.name = "TimeoutError";
		Object.setPrototypeOf(this, TimeoutError.prototype);
	}
}

export class ConnectionError extends NetworkError {
	constructor(message: string, httpStatus: number) {
		super(message, httpStatus);
		this.name = "ConnectionError";
		Object.setPrototypeOf(this, ConnectionError.prototype);
	}
}
