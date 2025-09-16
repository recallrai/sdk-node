import { RecallrAIError } from './base';
import { AuthenticationError } from './auth';
import { NetworkError, TimeoutError, ConnectionError } from './network';
import { ServerError, InternalServerError, RateLimitError } from './server';
import { SessionError, SessionNotFoundError, InvalidSessionStateError } from './sessions';
import { UserError, UserNotFoundError, UserAlreadyExistsError } from './users';
import { ValidationError } from './validation';

export {
    // Base error
    RecallrAIError,
    
    // Authentication errors
    AuthenticationError,
    
    // Network errors
    NetworkError,
    TimeoutError,
    ConnectionError,
    
    // Server errors
    ServerError,
    InternalServerError,
    RateLimitError,
    
    // Session errors
    SessionError,
    SessionNotFoundError,
    InvalidSessionStateError,
    
    // User errors
    UserError,
    UserNotFoundError,
    UserAlreadyExistsError,
    
    // Validation errors
    ValidationError
};
