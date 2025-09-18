import { RecallrAI } from './client';
import { User } from './user';
import { Session } from './session';

// Import errors explicitly
import { 
    RecallrAIError,
    AuthenticationError,
    NetworkError,
    TimeoutError,
    ConnectionError,
    ServerError,
    InternalServerError,
    RateLimitError,
    SessionError,
    InvalidSessionStateError,
    SessionNotFoundError,
    UserError,
    UserNotFoundError,
    UserAlreadyExistsError,
    ValidationError
} from './errors';

// Export main classes
export { RecallrAI, User, Session };

// Export errors explicitly
export const errors = {
    RecallrAIError,
    AuthenticationError,
    NetworkError,
    TimeoutError,
    ConnectionError,
    ServerError,
    InternalServerError,
    RateLimitError,
    SessionError,
    InvalidSessionStateError,
    SessionNotFoundError,
    UserError,
    UserNotFoundError,
    UserAlreadyExistsError,
    ValidationError
};

// The current version of the SDK
import pkg from '../package.json';
export const version = pkg.version;

// Default export is the RecallrAI client
export default RecallrAI;
