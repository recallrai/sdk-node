/**
 * Merge conflicts-related exceptions for the RecallrAI SDK.
 */

import { RecallrAIError } from './base';

/**
 * Base class for merge conflict-related exceptions.
 * 
 * This exception is raised for errors related to merge conflict management
 * in the RecallrAI API.
 */
export class MergeConflictError extends RecallrAIError {
    constructor(message: string, httpStatus: number) {
        super(message, httpStatus);
        Object.setPrototypeOf(this, MergeConflictError.prototype);
    }
}

/**
 * Raised when a merge conflict is not found.
 * 
 * This exception is typically raised when trying to access or modify
 * a merge conflict that doesn't exist.
 */
export class MergeConflictNotFoundError extends MergeConflictError {
    constructor(message: string, httpStatus: number) {
        super(message, httpStatus);
        Object.setPrototypeOf(this, MergeConflictNotFoundError.prototype);
    }
}

/**
 * Raised when trying to resolve a merge conflict that is already resolved.
 * 
 * This exception is typically raised when trying to resolve a merge conflict
 * that has already been processed.
 */
export class MergeConflictAlreadyResolvedError extends MergeConflictError {
    constructor(message: string, httpStatus: number) {
        super(message, httpStatus);
        Object.setPrototypeOf(this, MergeConflictAlreadyResolvedError.prototype);
    }
}

/**
 * Raised when trying to resolve a merge conflict with invalid questions.
 * 
 * This exception is raised when the provided questions don't match the 
 * original clarifying questions for the merge conflict.
 */
export class MergeConflictInvalidQuestionsError extends MergeConflictError {
    constructor(message: string, httpStatus: number) {
        super(message, httpStatus);
        Object.setPrototypeOf(this, MergeConflictInvalidQuestionsError.prototype);
    }
}

/**
 * Raised when trying to resolve a merge conflict with missing answers.
 * 
 * This exception is raised when not all required clarifying questions 
 * have been answered.
 */
export class MergeConflictMissingAnswersError extends MergeConflictError {
    constructor(message: string, httpStatus: number) {
        super(message, httpStatus);
        Object.setPrototypeOf(this, MergeConflictMissingAnswersError.prototype);
    }
}

/**
 * Raised when trying to resolve a merge conflict with invalid answer options.
 * 
 * This exception is raised when the provided answer is not one of the 
 * valid options for a question.
 */
export class MergeConflictInvalidAnswerError extends MergeConflictError {
    constructor(message: string, httpStatus: number) {
        super(message, httpStatus);
        Object.setPrototypeOf(this, MergeConflictInvalidAnswerError.prototype);
    }
}