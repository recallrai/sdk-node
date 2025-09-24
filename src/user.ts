import { HTTPClient } from './utils/http-client';
import { UserModel, UserMemoriesList, UserMessagesList } from './models/user';
import { Session } from './session';
import { SessionList } from './models/session';
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

export class User {
    private http: HTTPClient;
    private userData: UserModel;
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
        this.http = httpClient;
        this.userData = userData;
        this.userId = userData.userId;
        this.metadata = userData.metadata;
        this.createdAt = userData.createdAt;
        this.lastActiveAt = userData.lastActiveAt;
    }

    /**
     * Refresh this user's data from the server.
     * 
     * @throws {UserNotFoundError} If the user is not found
     */
    async refresh(): Promise<void> {
        try {
            const response = await this.http.get(`/api/v1/users/${this.userId}`);
            const updatedData = UserModel.fromApiResponse(response.data);
            this.userData = updatedData;
            this.userId = updatedData.userId;
            this.metadata = updatedData.metadata;
            this.lastActiveAt = updatedData.lastActiveAt;
        } catch (error: any) {
            if (error.status === 404) {
                throw new UserNotFoundError(`User ${this.userId} not found`, error.status);
            }
            throw error;
        }
    }

    /**
     * Update this user's metadata or ID.
     * 
     * @param newMetadata New metadata to associate with the user
     * @param newUserId New ID for the user
     * @returns The updated user object
     * @throws {UserNotFoundError} If the user is not found
     * @throws {UserAlreadyExistsError} If a user with the new_user_id already exists
     */
    async update(newMetadata?: Record<string, any>, newUserId?: string): Promise<User> {
        const data: Record<string, any> = {};

        if (newMetadata !== undefined) {
            data.metadata = newMetadata;
        }

        if (newUserId !== undefined) {
            data.new_user_id = newUserId;
        }

        try {
            const response = await this.http.put(`/api/v1/users/${this.userId}`, data);
            const updatedData = UserModel.fromApiResponse(response.data);

            // Update internal state
            this.userData = updatedData;
            this.userId = updatedData.userId;
            this.metadata = updatedData.metadata;
            this.lastActiveAt = updatedData.lastActiveAt;

            return this;
        } catch (error: any) {
            if (error.status === 404) {
                throw new UserNotFoundError(`User ${this.userId} not found`, error.status);
            } else if (error.status === 409) {
                throw new UserAlreadyExistsError(`User ${newUserId} already exists`, error.status);
            }
            throw new RecallrAIError(
                `Failed to update user: ${error.message || 'Unknown error'}`,
                error.status
            );
        }
    }

    /**
     * Delete this user.
     * 
     * @throws {UserNotFoundError} If the user is not found
     */
    async delete(): Promise<void> {
        try {
            const response = await this.http.delete(`/api/v1/users/${this.userId}`);
            if (response.status !== 204) {
                throw new RecallrAIError(
                    'Failed to delete user',
                    response.status
                );
            }
        } catch (error: any) {
            if (error.status === 404) {
                throw new UserNotFoundError(`User ${this.userId} not found`, error.status);
            }
            throw error;
        }
    }

    /**
     * Create a new session for this user.
     * 
     * @param autoProcessAfterMinutes Minutes to wait before auto-processing (-1 to disable)
     * @returns A Session object to interact with the created session
     * @throws {UserNotFoundError} If the user is not found
     */
    async createSession(autoProcessAfterSeconds: number = 600, metadata?: Record<string, any>): Promise<Session> {
        try {
            const response = await this.http.post(
                `/api/v1/users/${this.userId}/sessions`,
                { auto_process_after_seconds: autoProcessAfterSeconds, metadata }
            );

            if (response.status !== 201) {
                throw new RecallrAIError(
                    'Failed to create session',
                    response.status
                );
            }

            const sessionId = response.data.session_id;
            return new Session(this.http, this.userId, sessionId);
        } catch (error: any) {
            if (error.status === 404) {
                throw new UserNotFoundError(`User ${this.userId} not found`, error.status);
            }
            throw error;
        }
    }

    /**
     * Get an existing session for this user.
     * 
     * @param sessionId ID of the session to retrieve
     * @returns A Session object to interact with the session
     * @throws {UserNotFoundError} If the user is not found
     * @throws {SessionNotFoundError} If the session is not found
     */
    async getSession(sessionId: string): Promise<Session> {
        // Verify the session exists by checking its status
        const session = new Session(this.http, this.userId, sessionId);
        try {
            await session.getStatus();  // This will raise appropriate errors if the session doesn't exist
            return session;
        } catch (error) {
            if (error instanceof SessionNotFoundError) {
                throw error;
            }
            throw new RecallrAIError(`Error retrieving session: ${(error as Error).message}`, 500);
        }
    }

    /**
     * List sessions for this user with pagination.
     * 
     * @param offset Number of records to skip
     * @param limit Maximum number of records to return
     * @returns List of sessions with pagination info
     * @throws {UserNotFoundError} If the user is not found
     */
    async listSessions(offset: number = 0, limit: number = 10, metadataFilter?: Record<string, any>, userMetadataFilter?: Record<string, any>): Promise<SessionList> {
        try {
            const response = await this.http.get(
                `/api/v1/users/${this.userId}/sessions`,
                { params: { offset, limit, metadata_filter: metadataFilter, user_metadata_filter: userMetadataFilter } }
            );

            return SessionList.fromApiResponse(response.data);
        } catch (error: any) {
            if (error.status === 404) {
                throw new UserNotFoundError(`User ${this.userId} not found`, error.status);
            }
            throw new RecallrAIError(
                `Failed to list sessions: ${error.message || 'Unknown error'}`,
                error.status
            );
        }
    }

    /**
     * List user memories with pagination and optional category filters.
     * 
     * @param offset Number of records to skip
     * @param limit Maximum number of records to return
     * @param categories Optional list of category strings to filter by
     * @throws {UserNotFoundError} If the user is not found
     * @throws {InvalidCategoriesError} If invalid categories are provided
     * @throws {RecallrAIError} For other API-related errors
     */
    async listMemories(offset: number = 0, limit: number = 20, categories?: string[]): Promise<UserMemoriesList> {
        try {
            const response = await this.http.get(
                `/api/v1/users/${this.userId}/memories`,
                { params: { offset, limit, categories } }
            );
            return UserMemoriesList.fromApiResponse(response.data);
        } catch (error: any) {
            if (error.status === 404) {
                throw new UserNotFoundError(`User ${this.userId} not found`, error.status);
            } else if (error.status === 400 && error.data?.error?.includes('categories')) {
                throw new InvalidCategoriesError(error.data.error, error.status);
            }
            throw error;
        }
    }

    /**
     * List merge conflicts for this user.
     * 
     * @param offset Number of records to skip
     * @param limit Maximum number of records to return
     * @param status Optional status filter
     * @param sortBy Field to sort by
     * @param sortOrder Sort order (asc or desc)
     * @throws {UserNotFoundError} If the user is not found
     * @throws {RecallrAIError} For other API-related errors
     */
    async listMergeConflicts(
        offset: number = 0,
        limit: number = 10,
        status?: MergeConflictStatus,
        sortBy: string = "created_at",
        sortOrder: string = "desc",
    ): Promise<MergeConflictList> {
        try {
            const params: any = { offset, limit, sort_by: sortBy, sort_order: sortOrder };
            if (status) {
                params.status = status;
            }
            
            const response = await this.http.get(
                `/api/v1/users/${this.userId}/merge_conflicts`,
                { params }
            );
            return MergeConflictList.fromApiResponse(response.data);
        } catch (error: any) {
            if (error.status === 404) {
                throw new UserNotFoundError(`User ${this.userId} not found`, error.status);
            }
            throw error;
        }
    }

    /**
     * Get a specific merge conflict by ID.
     * 
     * @param conflictId The ID of the merge conflict to retrieve
     * @throws {UserNotFoundError} If the user doesn't exist
     * @throws {MergeConflictNotFoundError} If the merge conflict doesn't exist
     * @throws {RecallrAIError} For other API-related errors
     */
    async getMergeConflict(conflictId: string): Promise<MergeConflict> {
        try {
            const response = await this.http.get(
                `/api/v1/users/${this.userId}/merge_conflicts/${conflictId}`
            );
            const conflictData = MergeConflictModel.fromApiResponse(response.data);
            return new MergeConflict(this.http, this.userId, conflictData);
        } catch (error: any) {
            if (error.status === 404) {
                if (error.data?.error?.includes('User')) {
                    throw new UserNotFoundError(error.data.error, error.status);
                } else {
                    throw new MergeConflictNotFoundError(error.data?.error || 'Merge conflict not found', error.status);
                }
            }
            throw error;
        }
    }

    /**
     * Get the last N messages for this user across all sessions.
     * 
     * @param n Number of messages to retrieve
     * @throws {UserNotFoundError} If the user doesn't exist
     * @throws {RecallrAIError} For other API-related errors
     */
    async getLastNMessages(n: number): Promise<UserMessagesList> {
        try {
            const response = await this.http.get(
                `/api/v1/users/${this.userId}/messages`,
                { params: { n } }
            );
            return UserMessagesList.fromApiResponse(response.data);
        } catch (error: any) {
            if (error.status === 404) {
                throw new UserNotFoundError(`User ${this.userId} not found`, error.status);
            }
            throw error;
        }
    }
}
