import { HTTPClient } from './utils/http-client';
import { 
    Context, 
    MessageRole, 
    SessionStatus, 
    SessionMessagesList,
    Session as SessionModel,
    RecallStrategy
} from './models/session';
import {
    UserNotFoundError,
    SessionNotFoundError,
    InvalidSessionStateError,
    RecallrAIError
} from './errors';

export class Session {
    private http: HTTPClient;
    private userId: string;
    private sessionData: SessionModel;
    public sessionId: string;
    public status: SessionStatus;
    public createdAt: Date;
    public metadata: Record<string, any>;

    /**
     * Initialize a session.
     * 
     * @param httpClient HTTP client for API communication
     * @param userId ID of the user who owns this session
     * @param sessionData Initial session data from the API
     */
    constructor(httpClient: HTTPClient, userId: string, sessionData: SessionModel) {
        this.http = httpClient;
        this.userId = userId;
        this.sessionData = sessionData;
        this.sessionId = sessionData.sessionId;
        this.status = sessionData.status;
        this.createdAt = sessionData.createdAt;
        this.metadata = sessionData.metadata;
    }

    /**
     * Add a message to the session.
     * 
     * @param role Role of the message sender
     * @param content Content of the message
     * @throws {UserNotFoundError} If the user is not found
     * @throws {SessionNotFoundError} If the session is not found
     * @throws {InvalidSessionStateError} If the session is already processed or processing
     */
    async addMessage(role: MessageRole, content: string): Promise<void> {
        try {
            const response = await this.http.post(
                `/api/v1/users/${this.userId}/sessions/${this.sessionId}/add-message`,
                { message: content, role }
            );

            if (response.status !== 200) {
                throw new RecallrAIError(
                    `Failed to add message: ${response.data?.detail || 'Unknown error'}`,
                    response.status
                );
            }
        } catch (error: any) {
            if (error.status === 404) {
                // Check if it's a user not found or session not found error
                const detail = error.message || '';
                if (detail.includes(`User ${this.userId} not found`)) {
                    throw new UserNotFoundError(`User ${this.userId} not found`, error.status);
                } else {
                    throw new SessionNotFoundError(`Session ${this.sessionId} not found`, error.status);
                }
            } else if (error.status === 400) {
                const detail = error.data?.detail || `Cannot add message to session with status ${this.status}`;
                throw new InvalidSessionStateError(detail, error.status);
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
     * @param recallStrategy The type of recall strategy to use
     * @param minTopK Minimum number of memories to return
     * @param maxTopK Maximum number of memories to return
     * @param memoriesThreshold Similarity threshold for memories
     * @param summariesThreshold Similarity threshold for summaries
     * @param lastNMessages Number of last messages to include in context
     * @param lastNSummaries Number of last summaries to include in context
     * @param timezone Timezone for formatting timestamps (e.g., 'America/New_York'). Undefined for UTC
     * @returns Context information with the memory text
     * @throws {UserNotFoundError} If the user is not found
     * @throws {SessionNotFoundError} If the session is not found
     */
    async getContext(
        recallStrategy: RecallStrategy = RecallStrategy.BALANCED,
        minTopK: number = 15,
        maxTopK: number = 50,
        memoriesThreshold: number = 0.6,
        summariesThreshold: number = 0.5,
        lastNMessages?: number,
        lastNSummaries?: number,
        timezone?: string
    ): Promise<Context> {
        try {
            const params: Record<string, any> = {
                recall_strategy: recallStrategy,
                min_top_k: minTopK,
                max_top_k: maxTopK,
                memories_threshold: memoriesThreshold,
                summaries_threshold: summariesThreshold,
            };
            
            if (lastNMessages !== undefined) {
                params.last_n_messages = lastNMessages;
            }
            if (lastNSummaries !== undefined) {
                params.last_n_summaries = lastNSummaries;
            }
            if (timezone !== undefined) {
                params.timezone = timezone;
            }

            const response = await this.http.get(
                `/api/v1/users/${this.userId}/sessions/${this.sessionId}/context`,
                { params }
            );

            if (response.status !== 200) {
                throw new RecallrAIError(
                    `Failed to get context: ${response.data?.detail || 'Unknown error'}`,
                    response.status
                );
            }

            if (this.status === SessionStatus.PROCESSED) {
                console.warn("You are trying to get context for a processed session. Why do you need it?");
            } else if (this.status === SessionStatus.PROCESSING) {
                console.warn("You are trying to get context for a processing session. Why do you need it?");
            }

            return Context.fromApiResponse(response.data);
        } catch (error: any) {
            if (error.status === 404) {
                // Check if it's a user not found or session not found error
                const detail = error.message || '';
                if (detail.includes(`User ${this.userId} not found`)) {
                    throw new UserNotFoundError(`User ${this.userId} not found`, error.status);
                } else {
                    throw new SessionNotFoundError(`Session ${this.sessionId} not found`, error.status);
                }
            }
            throw error;
        }
    }

    /**
     * Update the session's metadata.
     * 
     * @param newMetadata New metadata to associate with the session
     * @throws {UserNotFoundError} If the user is not found
     * @throws {SessionNotFoundError} If the session is not found
     */
    async update(newMetadata?: Record<string, any>): Promise<void> {
        try {
            const response = await this.http.put(
                `/api/v1/users/${this.userId}/sessions/${this.sessionId}`,
                { metadata: newMetadata || {} }
            );

            if (response.status !== 200) {
                throw new RecallrAIError(
                    `Failed to update session: ${response.data?.detail || 'Unknown error'}`,
                    response.status
                );
            }

            const updatedData = SessionModel.fromApiResponse(response.data);
            this.metadata = updatedData.metadata;
        } catch (error: any) {
            if (error.status === 404) {
                // Check if it's a user not found or session not found error
                const detail = error.message || '';
                if (detail.includes(`User ${this.userId} not found`)) {
                    throw new UserNotFoundError(`User ${this.userId} not found`, error.status);
                } else {
                    throw new SessionNotFoundError(`Session ${this.sessionId} not found`, error.status);
                }
            }
            throw error;
        }
    }

    /**
     * Refresh the session data from the API.
     * 
     * This method updates the local session data to reflect any changes
     * that may have occurred on the server.
     * 
     * @throws {UserNotFoundError} If the user is not found
     * @throws {SessionNotFoundError} If the session is not found
     */
    async refresh(): Promise<void> {
        try {
            const response = await this.http.get(
                `/api/v1/users/${this.userId}/sessions/${this.sessionId}`
            );

            if (response.status !== 200) {
                throw new RecallrAIError(
                    `Failed to refresh session: ${response.data?.detail || 'Unknown error'}`,
                    response.status
                );
            }

            this.sessionData = SessionModel.fromApiResponse(response.data);
            this.status = this.sessionData.status;
            this.createdAt = this.sessionData.createdAt;
            this.metadata = this.sessionData.metadata;
        } catch (error: any) {
            if (error.status === 404) {
                // Check if it's a user not found or session not found error
                const detail = error.message || '';
                if (detail.includes(`User ${this.userId} not found`)) {
                    throw new UserNotFoundError(`User ${this.userId} not found`, error.status);
                } else {
                    throw new SessionNotFoundError(`Session ${this.sessionId} not found`, error.status);
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
                    response.status
                );
            }
        } catch (error: any) {
            if (error.status === 404) {
                // Check if it's a user not found or session not found error
                const detail = error.message || '';
                if (detail.includes(`User ${this.userId} not found`)) {
                    throw new UserNotFoundError(`User ${this.userId} not found`, error.status);
                } else {
                    throw new SessionNotFoundError(`Session ${this.sessionId} not found`, error.status);
                }
            } else if (error.status === 400) {
                const detail = error.data?.detail || `Cannot process session with status ${this.status}`;
                throw new InvalidSessionStateError(detail, error.status);
            }
            throw error;
        }
    }

    /**
     * Get all messages in the session.
     * 
     * @param offset Number of records to skip
     * @param limit Maximum number of records to return
     * @returns Paginated list of messages in the session
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
                    response.status
                );
            }

            return SessionMessagesList.fromApiResponse(response.data);
        } catch (error: any) {
            if (error.status === 404) {
                // Check if it's a user not found or session not found error
                const detail = error.message || '';
                if (detail.includes(`User ${this.userId} not found`)) {
                    throw new UserNotFoundError(`User ${this.userId} not found`, error.status);
                } else {
                    throw new SessionNotFoundError(`Session ${this.sessionId} not found`, error.status);
                }
            }
            throw error;
        }
    }
}
