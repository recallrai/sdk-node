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
    SessionError,
    InvalidSessionStateError,
    SessionNotFoundError,
    UserError,
    UserNotFoundError,
    UserAlreadyExistsError,
    ValidationError
};

// The current version of the SDK
export const version = '0.1.0';

// Default export is the RecallrAI client
export default RecallrAI;
