/**
 * User management functionality for the RecallrAI SDK.
 */

import { HTTPClient } from './utils/http-client';
import { UserModel, UserMemoriesList, UserMessagesList } from './models/user';
import { Session } from './session';
import { SessionList, SessionStatus, Session as SessionModel } from './models/session';
import { MergeConflict } from './merge_conflict';
import { 
    MergeConflictList,
    MergeConflictStatus,
    MergeConflictModel,
} from './models/merge_conflict';
import {
    UserNotFoundError,
    UserAlreadyExistsError,
    InvalidCategoriesError,
    SessionNotFoundError,
    MergeConflictNotFoundError,
    RecallrAIError
} from './errors';

/**
 * Represents a user in the RecallrAI system with methods for user management.
 * 
 * This class wraps a user object and provides methods for updating user data,
 * and for creating and managing sessions.
 */
export class User {
    private _http: HTTPClient;
    private _userData: UserModel;
    public userId: string;
    public metadata: Record<string, any>;
    public createdAt: Date;
    public lastActiveAt: Date;

    /**
     * Initialize a user.
     * 
     * @param httpClient HTTP client for API communication
     * @param userData User data model with user information
     */
    constructor(httpClient: HTTPClient, userData: UserModel) {
        this._http = httpClient;
        this._userData = userData;
        this.userId = userData.userId;
        this.metadata = userData.metadata;
        this.createdAt = userData.createdAt;
        this.lastActiveAt = userData.lastActiveAt;
    }

    /**
     * Update this user's metadata or ID.
     * 
     * @param newMetadata New metadata to associate with the user
     * @param newUserId New ID for the user
     * 
     * @throws {UserNotFoundError} If the user is not found
     * @throws {UserAlreadyExistsError} If a user with the new_user_id already exists
     * @throws {AuthenticationError} If the API key or project ID is invalid
     * @throws {InternalServerError} If the server encounters an error
     * @throws {NetworkError} If there are network issues
     * @throws {TimeoutError} If the request times out
     * @throws {RecallrAIError} For other API-related errors
     */
    async update(newMetadata?: Record<string, any>, newUserId?: string): Promise<void> {
        const data: Record<string, any> = {};
        
        if (newMetadata !== undefined) {
            data.new_metadata = newMetadata;
        }
        if (newUserId !== undefined) {
            data.new_user_id = newUserId;
        }
        
        const response = await this._http.put(`/api/v1/users/${this.userId}`, data);
        
        if (response.status === 404) {
            const detail = response.data?.detail || `User with ID ${this.userId} not found`;
            throw new UserNotFoundError(detail, response.status);
        } else if (response.status === 409) {
            const detail = response.data?.detail || `User with ID ${newUserId} already exists`;
            throw new UserAlreadyExistsError(detail, response.status);
        } else if (response.status !== 200) {
            throw new RecallrAIError(
                response.data?.detail || 'Unknown error',
                response.status
            );
        }
        
        const updatedData = UserModel.fromApiResponse(response.data);
        
        // Update internal state
        this._userData = updatedData;
        this.userId = updatedData.userId;
        this.metadata = updatedData.metadata;
        this.lastActiveAt = updatedData.lastActiveAt;
    }

    /**
     * Refresh this user's data from the server.
     * 
     * @throws {UserNotFoundError} If the user is not found
     * @throws {AuthenticationError} If the API key or project ID is invalid
     * @throws {InternalServerError} If the server encounters an error
     * @throws {NetworkError} If there are network issues
     * @throws {TimeoutError} If the request times out
     * @throws {RecallrAIError} For other API-related errors
     */
    async refresh(): Promise<void> {
        const response = await this._http.get(`/api/v1/users/${this.userId}`);
        
        if (response.status === 404) {
            const detail = response.data?.detail || `User with ID ${this.userId} not found`;
            throw new UserNotFoundError(detail, response.status);
        } else if (response.status !== 200) {
            throw new RecallrAIError(
                response.data?.detail || 'Unknown error',
                response.status
            );
        }
        
        const refreshedData = UserModel.fromApiResponse(response.data);
        
        // Update internal state
        this._userData = refreshedData;
        this.userId = refreshedData.userId;
        this.metadata = refreshedData.metadata;
        this.createdAt = refreshedData.createdAt;
        this.lastActiveAt = refreshedData.lastActiveAt;
    }

    /**
     * Delete this user.
     * 
     * @throws {UserNotFoundError} If the user is not found
     * @throws {AuthenticationError} If the API key or project ID is invalid
     * @throws {InternalServerError} If the server encounters an error
     * @throws {NetworkError} If there are network issues
     * @throws {TimeoutError} If the request times out
     * @throws {RecallrAIError} For other API-related errors
     */
    async delete(): Promise<void> {
        const response = await this._http.delete(`/api/v1/users/${this.userId}`);
        
        if (response.status === 404) {
            const detail = response.data?.detail || `User with ID ${this.userId} not found`;
            throw new UserNotFoundError(detail, response.status);
        } else if (response.status !== 204) {
            throw new RecallrAIError(
                response.data?.detail || 'Unknown error',
                response.status
            );
        }
    }

    /**
     * Create a new session for this user.
     * 
     * @param autoProcessAfterSeconds Seconds of inactivity allowed before automatically processing the session (min 600)
     * @param metadata Optional metadata for the session
     * @returns A Session object to interact with the created session
     * 
     * @throws {UserNotFoundError} If the user is not found
     * @throws {AuthenticationError} If the API key or project ID is invalid
     * @throws {InternalServerError} If the server encounters an error
     * @throws {NetworkError} If there are network issues
     * @throws {TimeoutError} If the request times out
     * @throws {RecallrAIError} For other API-related errors
     */
    async createSession(autoProcessAfterSeconds: number = 600, metadata?: Record<string, any>): Promise<Session> {
        const payload: Record<string, any> = {
            auto_process_after_seconds: autoProcessAfterSeconds,
            metadata: metadata || {},
        };
        
        const response = await this._http.post(
            `/api/v1/users/${this.userId}/sessions`,
            payload
        );
        
        if (response.status === 404) {
            const detail = response.data?.detail || `User ${this.userId} not found`;
            throw new UserNotFoundError(detail, response.status);
        } else if (response.status !== 201) {
            throw new RecallrAIError(
                response.data?.detail || 'Unknown error',
                response.status
            );
        }
        
        const sessionData = SessionModel.fromApiResponse(response.data);
        return new Session(this._http, this.userId, sessionData);
    }

    /**
     * Get an existing session for this user.
     * 
     * @param sessionId ID of the session to retrieve
     * @returns A Session object to interact with the session
     * 
     * @throws {UserNotFoundError} If the user is not found
     * @throws {SessionNotFoundError} If the session is not found
     * @throws {AuthenticationError} If the API key or project ID is invalid
     * @throws {InternalServerError} If the server encounters an error
     * @throws {NetworkError} If there are network issues
     * @throws {TimeoutError} If the request times out
     * @throws {RecallrAIError} For other API-related errors
     */
    async getSession(sessionId: string): Promise<Session> {
        // First, verify the session exists by fetching its details
        const response = await this._http.get(`/api/v1/users/${this.userId}/sessions/${sessionId}`);
        
        if (response.status === 404) {
            // Check if it's a user not found or session not found error
            const detail = response.data?.detail || '';
            if (detail.includes(`User ${this.userId} not found`)) {
                throw new UserNotFoundError(detail, response.status);
            } else {
                throw new SessionNotFoundError(detail, response.status);
            }
        } else if (response.status !== 200) {
            throw new RecallrAIError(
                response.data?.detail || 'Unknown error',
                response.status
            );
        }
        
        const sessionData = SessionModel.fromApiResponse(response.data);
        return new Session(this._http, this.userId, sessionData);
    }

    /**
     * List sessions for this user with pagination.
     * 
     * @param offset Number of records to skip
     * @param limit Maximum number of records to return
     * @param metadataFilter Optional metadata filter for sessions
     * @param userMetadataFilter Optional metadata filter for the user
     * @param statusFilter Optional list of session statuses to filter by (e.g., ["pending", "processing", "processed", "insufficient_balance"])
     * @returns List of sessions with pagination info
     * 
     * @throws {UserNotFoundError} If the user is not found
     * @throws {AuthenticationError} If the API key or project ID is invalid
     * @throws {InternalServerError} If the server encounters an error
     * @throws {NetworkError} If there are network issues
     * @throws {TimeoutError} If the request times out
     * @throws {RecallrAIError} For other API-related errors
     */
    async listSessions(
        offset: number = 0, 
        limit: number = 10, 
        metadataFilter?: Record<string, any>, 
        userMetadataFilter?: Record<string, any>,
        statusFilter?: SessionStatus[]
    ): Promise<SessionList> {
        const params: Record<string, any> = { offset, limit };
        
        if (metadataFilter !== undefined) {
            params.metadata_filter = JSON.stringify(metadataFilter);
        }
        if (userMetadataFilter !== undefined) {
            params.user_metadata_filter = JSON.stringify(userMetadataFilter);
        }
        if (statusFilter !== undefined) {
            params.status_filter = statusFilter;
        }

        const response = await this._http.get(
            `/api/v1/users/${this.userId}/sessions`,
            { params }
        );
        
        if (response.status === 404) {
            const detail = response.data?.detail || `User ${this.userId} not found`;
            throw new UserNotFoundError(detail, response.status);
        } else if (response.status !== 200) {
            throw new RecallrAIError(
                response.data?.detail || 'Unknown error',
                response.status
            );
        }
        
        return SessionList.fromApiResponse(response.data, this.userId, this._http);
    }

    /**
     * List memories for this user with optional category filters.
     * 
     * @param offset Number of records to skip
     * @param limit Maximum number of records to return (1-200)
     * @param categories Optional list of category names to filter by
     * @param includePreviousVersions Include full version history for each memory (default: true)
     * @param includeConnectedMemories Include connected memories (default: true)
     * @returns Paginated list of memory items
     * 
     * @throws {UserNotFoundError} If the user is not found
     * @throws {InvalidCategoriesError} If invalid categories are provided
     * @throws {AuthenticationError} If the API key or project ID is invalid
     * @throws {InternalServerError} If the server encounters an error
     * @throws {NetworkError} If there are network issues
     * @throws {TimeoutError} If the request times out
     * @throws {RecallrAIError} For other API-related errors
     */
    async listMemories(
        offset: number = 0, 
        limit: number = 20, 
        categories?: string[],
        includePreviousVersions: boolean = true,
        includeConnectedMemories: boolean = true
    ): Promise<UserMemoriesList> {
        const params: Record<string, any> = {
            offset,
            limit,
            include_previous_versions: includePreviousVersions,
            include_connected_memories: includeConnectedMemories,
        };
        
        if (categories !== undefined) {
            params.categories = categories;
        }

        const response = await this._http.get(
            `/api/v1/users/${this.userId}/memories`,
            { params }
        );

        if (response.status === 404) {
            const detail = response.data?.detail || `User ${this.userId} not found`;
            throw new UserNotFoundError(detail, response.status);
        } else if (response.status === 400) {
            // Backend returns 400 for invalid categories
            const detail = response.data?.detail || 'Invalid categories provided';
            throw new InvalidCategoriesError(detail, response.status);
        } else if (response.status !== 200) {
            throw new RecallrAIError(
                response.data?.detail || 'Unknown error',
                response.status
            );
        }

        return UserMemoriesList.fromApiResponse(response.data);
    }

    /**
     * List merge conflicts for this user.
     * 
     * @param offset Number of records to skip
     * @param limit Maximum number of records to return
     * @param status Optional filter by conflict status
     * @param sortBy Field to sort by (created_at, resolved_at)
     * @param sortOrder Sort order (asc, desc)
     * @returns Paginated list of merge conflicts
     * 
     * @throws {UserNotFoundError} If the user is not found
     * @throws {AuthenticationError} If the API key or project ID is invalid
     * @throws {InternalServerError} If the server encounters an error
     * @throws {NetworkError} If there are network issues
     * @throws {TimeoutError} If the request times out
     * @throws {RecallrAIError} For other API-related errors
     */
    async listMergeConflicts(
        offset: number = 0,
        limit: number = 10,
        status?: MergeConflictStatus,
        sortBy: string = "created_at",
        sortOrder: string = "desc",
    ): Promise<MergeConflictList> {
        const params: Record<string, any> = {
            offset,
            limit,
            sort_by: sortBy,
            sort_order: sortOrder,
        };
        
        if (status !== undefined) {
            params.status = status;
        }

        const response = await this._http.get(
            `/api/v1/users/${this.userId}/merge-conflicts`,
            { params }
        );

        if (response.status === 404) {
            const detail = response.data?.detail || `User ${this.userId} not found`;
            throw new UserNotFoundError(detail, response.status);
        } else if (response.status !== 200) {
            throw new RecallrAIError(
                response.data?.detail || 'Unknown error',
                response.status
            );
        }

        return MergeConflictList.fromApiResponse(response.data, this._http, this.userId);
    }

    /**
     * Get a specific merge conflict by ID.
     * 
     * @param conflictId Unique identifier of the merge conflict
     * @returns The merge conflict object
     * 
     * @throws {UserNotFoundError} If the user is not found
     * @throws {MergeConflictNotFoundError} If the merge conflict is not found
     * @throws {AuthenticationError} If the API key or project ID is invalid
     * @throws {InternalServerError} If the server encounters an error
     * @throws {NetworkError} If there are network issues
     * @throws {TimeoutError} If the request times out
     * @throws {RecallrAIError} For other API-related errors
     */
    async getMergeConflict(conflictId: string): Promise<MergeConflict> {
        const response = await this._http.get(
            `/api/v1/users/${this.userId}/merge-conflicts/${conflictId}`
        );

        if (response.status === 404) {
            // Check if it's a user not found or conflict not found error
            const detail = response.data?.detail || '';
            if (detail.includes(`User ${this.userId} not found`)) {
                throw new UserNotFoundError(detail, response.status);
            } else {
                throw new MergeConflictNotFoundError(detail, response.status);
            }
        } else if (response.status !== 200) {
            throw new RecallrAIError(
                response.data?.detail || 'Unknown error',
                response.status
            );
        }

        const conflictData = MergeConflictModel.fromApiResponse(response.data);
        return new MergeConflict(this._http, this.userId, conflictData);
    }

    /**
     * Get the last N messages for this user across all their sessions.
     * 
     * This method is useful for chatbot applications where you want to see
     * the recent conversation history for context.
     * 
     * @param n Number of recent messages to retrieve (1-100, default: 10)
     * @returns List of the most recent messages
     * 
     * @throws {UserNotFoundError} If the user is not found
     * @throws {AuthenticationError} If the API key or project ID is invalid
     * @throws {InternalServerError} If the server encounters an error
     * @throws {NetworkError} If there are network issues
     * @throws {TimeoutError} If the request times out
     * @throws {RecallrAIError} For other API-related errors
     * @throws {Error} If n is not between 1 and 100
     */
    async getLastNMessages(n: number): Promise<UserMessagesList> {
        if (n < 1 || n > 100) {
            throw new Error('n must be between 1 and 100');
        }
        
        const response = await this._http.get(
            `/api/v1/users/${this.userId}/messages`,
            { params: { limit: n } }
        );
        
        if (response.status === 404) {
            const detail = response.data?.detail || `User with ID ${this.userId} not found`;
            throw new UserNotFoundError(detail, response.status);
        } else if (response.status !== 200) {
            throw new RecallrAIError(
                response.data?.detail || 'Unknown error',
                response.status
            );
        }
        
        return UserMessagesList.fromApiResponse(response.data);
    }

    /**
     * String representation of the user.
     */
    toString(): string {
        return `<User id=${this.userId} created_at=${this.createdAt} last_active_at=${this.lastActiveAt}>`;
    }
}
