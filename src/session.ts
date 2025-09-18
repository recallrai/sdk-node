import { HTTPClient } from './utils/http-client';
import { Context, MessageRole, SessionStatus, SessionMessagesList } from './models/session';
import {
    UserNotFoundError,
    SessionNotFoundError,
    InvalidSessionStateError,
    RecallrAIError
} from './errors';

export class Session {
    private http: HTTPClient;
    public userId: string;
    public sessionId: string;

    /**
     * Initialize a session.
     * 
     * @param httpClient HTTP client for API communication
     * @param userId ID of the user who owns this session
     * @param sessionId Unique identifier for the session
     */
    constructor(httpClient: HTTPClient, userId: string, sessionId: string) {
        this.http = httpClient;
        this.userId = userId;
        this.sessionId = sessionId;
    }

    /**
     * Add a user message to the session.
     * 
     * @param message Content of the user message
     * @throws {UserNotFoundError} If the user is not found
     * @throws {SessionNotFoundError} If the session is not found
     * @throws {InvalidSessionStateError} If the session is already processed or processing
     */
    async addUserMessage(message: string): Promise<void> {
        await this.addMessage(message, MessageRole.USER);
    }

    /**
     * Add an assistant message to the session.
     * 
     * @param message Content of the assistant message
     * @throws {UserNotFoundError} If the user is not found
     * @throws {SessionNotFoundError} If the session is not found
     * @throws {InvalidSessionStateError} If the session is already processed or processing
     */
    async addAssistantMessage(message: string): Promise<void> {
        await this.addMessage(message, MessageRole.ASSISTANT);
    }

    /**
     * Internal helper to add a message to the session.
     * 
     * @param message Content of the message
     * @param role Role of the message sender
     * @throws {UserNotFoundError} If the user is not found
     * @throws {SessionNotFoundError} If the session is not found
     * @throws {InvalidSessionStateError} If the session is already processed or processing
     */
    private async addMessage(message: string, role: MessageRole): Promise<void> {
        try {
            const response = await this.http.post(
                `/api/v1/users/${this.userId}/sessions/${this.sessionId}/add-message`,
                { message, role }
            );

            if (response.status !== 200) {
                throw new RecallrAIError(
                    `Failed to add message: ${response.data?.detail || 'Unknown error'}`,
                    undefined,
                    response.status
                );
            }
        } catch (error: any) {
            if (error.status === 404) {
                // Check if it's a user not found or session not found error
                const detail = error.message || '';
                if (detail.includes(`User ${this.userId} not found`)) {
                    throw new UserNotFoundError(this.userId);
                } else {
                    throw new SessionNotFoundError(this.sessionId);
                }
            } else if (error.status === 400) {
                const status = await this.getStatus();
                throw new InvalidSessionStateError(
                    `Cannot add message to session with status ${status}`
                );
            }
            throw error;
        }
    }

    /**
     * Get the current context for this session.
     * 
     * The context contains information from the user's memory that is relevant
     * to the current conversation.
     * 
     * @returns Context information with the memory text and whether memory was used
     * @throws {UserNotFoundError} If the user is not found
     * @throws {SessionNotFoundError} If the session is not found
     */
    async getContext(): Promise<Context> {
        try {
            const response = await this.http.get(
                `/api/v1/users/${this.userId}/sessions/${this.sessionId}/context`
            );

            if (response.status !== 200) {
                throw new RecallrAIError(
                    `Failed to get context: ${response.data?.detail || 'Unknown error'}`,
                    undefined,
                    response.status
                );
            }

            const status = await this.getStatus();
            if (status === SessionStatus.PROCESSED) {
                console.warn("Cannot add message to a session that has already been processed");
            } else if (status === SessionStatus.PROCESSING) {
                console.warn("Cannot add message to a session that is currently being processed");
            }

            return Context.fromApiResponse(response.data);
        } catch (error: any) {
            if (error.status === 404) {
                // Check if it's a user not found or session not found error
                const detail = error.message || '';
                if (detail.includes(`User ${this.userId} not found`)) {
                    throw new UserNotFoundError(this.userId);
                } else {
                    throw new SessionNotFoundError(this.sessionId);
                }
            }
            throw error;
        }
    }

    /**
     * Process the session to update the user's memory.
     * 
     * This method triggers the processing of the conversation to extract and update
     * the user's memory.
     * 
     * @throws {UserNotFoundError} If the user is not found
     * @throws {SessionNotFoundError} If the session is not found
     * @throws {InvalidSessionStateError} If the session is already processed or being processed
     */
    async process(): Promise<void> {
        try {
            const response = await this.http.post(
                `/api/v1/users/${this.userId}/sessions/${this.sessionId}/process`
            );

            if (response.status !== 200) {
                throw new RecallrAIError(
                    `Failed to process session: ${response.data?.detail || 'Unknown error'}`,
                    undefined,
                    response.status
                );
            }
        } catch (error: any) {
            if (error.status === 404) {
                // Check if it's a user not found or session not found error
                const detail = error.message || '';
                if (detail.includes(`User ${this.userId} not found`)) {
                    throw new UserNotFoundError(this.userId);
                } else {
                    throw new SessionNotFoundError(this.sessionId);
                }
            } else if (error.status === 400) {
                const status = await this.getStatus();
                throw new InvalidSessionStateError(
                    `Cannot process session with status ${status}`
                );
            }
            throw error;
        }
    }

    /**
     * Get the current status of the session.
     * 
     * @returns The current status of the session
     * @throws {UserNotFoundError} If the user is not found
     * @throws {SessionNotFoundError} If the session is not found
     */
    async getStatus(): Promise<SessionStatus> {
        try {
            const response = await this.http.get(
                `/api/v1/users/${this.userId}/sessions/${this.sessionId}/status`
            );

            if (response.status !== 200) {
                throw new RecallrAIError(
                    `Failed to get session status: ${response.data?.detail || 'Unknown error'}`,
                    undefined,
                    response.status
                );
            }

            return response.data.status as SessionStatus;
        } catch (error: any) {
            if (error.status === 404) {
                // Check if it's a user not found or session not found error
                const detail = error.message || '';
                if (detail.includes(`User ${this.userId} not found`)) {
                    throw new UserNotFoundError(this.userId);
                } else {
                    throw new SessionNotFoundError(this.sessionId);
                }
            }
            throw error;
        }
    }

    /**
     * Get all messages in the session.
     * 
     * @returns List of messages in the session
     * @throws {UserNotFoundError} If the user is not found
     * @throws {SessionNotFoundError} If the session is not found
     */
    async getMessages(offset: number = 0, limit: number = 50): Promise<SessionMessagesList> {
        try {
            const response = await this.http.get(
                `/api/v1/users/${this.userId}/sessions/${this.sessionId}/messages`,
                { params: { offset, limit } }
            );

            if (response.status !== 200) {
                throw new RecallrAIError(
                    `Failed to get messages: ${response.data?.detail || 'Unknown error'}`,
                    undefined,
                    response.status
                );
            }

            return SessionMessagesList.fromApiResponse(response.data);
        } catch (error: any) {
            if (error.status === 404) {
                // Check if it's a user not found or session not found error
                const detail = error.message || '';
                if (detail.includes(`User ${this.userId} not found`)) {
                    throw new UserNotFoundError(this.userId);
                } else {
                    throw new SessionNotFoundError(this.sessionId);
                }
            }
            throw error;
        }
    }
}
