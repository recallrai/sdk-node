import { RecallrAIError } from "./base";

export class UserError extends RecallrAIError {
	constructor(message: string, httpStatus: number) {
		super(message, httpStatus);
		this.name = "UserError";
		Object.setPrototypeOf(this, UserError.prototype);
	}
}

export class UserNotFoundError extends UserError {
	constructor(message: string, httpStatus: number) {
		super(message, httpStatus);
		this.name = "UserNotFoundError";
		Object.setPrototypeOf(this, UserNotFoundError.prototype);
	}
}

export class UserAlreadyExistsError extends UserError {
	constructor(message: string, httpStatus: number) {
		super(message, httpStatus);
		this.name = "UserAlreadyExistsError";
		Object.setPrototypeOf(this, UserAlreadyExistsError.prototype);
	}
}

export class InvalidCategoriesError extends UserError {
	constructor(message: string, httpStatus: number) {
		super(message, httpStatus);
		this.name = "InvalidCategoriesError";
		Object.setPrototypeOf(this, InvalidCategoriesError.prototype);
	}
}
