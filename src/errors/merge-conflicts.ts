import { RecallrAIError } from "./base";

export class MergeConflictError extends RecallrAIError {
	constructor(message: string, httpStatus: number) {
		super(message, httpStatus);
		this.name = "MergeConflictError";
		Object.setPrototypeOf(this, MergeConflictError.prototype);
	}
}

export class MergeConflictNotFoundError extends MergeConflictError {
	constructor(message: string, httpStatus: number) {
		super(message, httpStatus);
		this.name = "MergeConflictNotFoundError";
		Object.setPrototypeOf(this, MergeConflictNotFoundError.prototype);
	}
}

export class MergeConflictAlreadyResolvedError extends MergeConflictError {
	constructor(message: string, httpStatus: number) {
		super(message, httpStatus);
		this.name = "MergeConflictAlreadyResolvedError";
		Object.setPrototypeOf(this, MergeConflictAlreadyResolvedError.prototype);
	}
}

export class MergeConflictInvalidQuestionsError extends MergeConflictError {
	constructor(message: string, httpStatus: number) {
		super(message, httpStatus);
		this.name = "MergeConflictInvalidQuestionsError";
		Object.setPrototypeOf(this, MergeConflictInvalidQuestionsError.prototype);
	}
}

export class MergeConflictMissingAnswersError extends MergeConflictError {
	constructor(message: string, httpStatus: number) {
		super(message, httpStatus);
		this.name = "MergeConflictMissingAnswersError";
		Object.setPrototypeOf(this, MergeConflictMissingAnswersError.prototype);
	}
}

export class MergeConflictInvalidAnswerError extends MergeConflictError {
	constructor(message: string, httpStatus: number) {
		super(message, httpStatus);
		this.name = "MergeConflictInvalidAnswerError";
		Object.setPrototypeOf(this, MergeConflictInvalidAnswerError.prototype);
	}
}
