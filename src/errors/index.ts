/**
 * Exceptions for the RecallrAI SDK.
 */

import { RecallrAIError } from './base';
import { AuthenticationError } from './auth';
import { TimeoutError, ConnectionError } from './network';
import { InternalServerError, RateLimitError } from './server';
import { SessionNotFoundError, InvalidSessionStateError } from './sessions';
import { UserNotFoundError, UserAlreadyExistsError, InvalidCategoriesError } from './users';
import { ValidationError } from './validation';
import { 
    MergeConflictError, 
    MergeConflictNotFoundError, 
    MergeConflictAlreadyResolvedError,
    MergeConflictInvalidQuestionsError,
    MergeConflictMissingAnswersError,
    MergeConflictInvalidAnswerError,
} from './merge_conflicts';

export {
    RecallrAIError,
    AuthenticationError,
    TimeoutError, 
    ConnectionError,
    InternalServerError,
    RateLimitError,
    SessionNotFoundError, 
    InvalidSessionStateError,
    UserNotFoundError, 
    UserAlreadyExistsError,
    InvalidCategoriesError,
    ValidationError,
    MergeConflictError,
    MergeConflictNotFoundError,
    MergeConflictAlreadyResolvedError,
    MergeConflictInvalidQuestionsError,
    MergeConflictMissingAnswersError,
    MergeConflictInvalidAnswerError,
};
