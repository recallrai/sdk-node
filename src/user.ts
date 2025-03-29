import { HTTPClient } from './utils/http-client';
import { UserModel } from './models/user';
import { Session } from './session';
import { SessionList } from './models/session';
import {
    UserNotFoundError,
    UserAlreadyExistsError,
    SessionNotFoundError,
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
                throw new UserNotFoundError(this.userId);
            } else if (error.status === 409) {
                throw new UserAlreadyExistsError(newUserId);
            }
            throw new RecallrAIError(
                `Failed to update user: ${error.message || 'Unknown error'}`,
                undefined,
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
                    undefined,
                    response.status
                );
            }
        } catch (error: any) {
            if (error.status === 404) {
                throw new UserNotFoundError(this.userId);
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
    async createSession(autoProcessAfterMinutes: number = -1): Promise<Session> {
        try {
            const response = await this.http.post(
                `/api/v1/users/${this.userId}/sessions`,
                { auto_process_after_minutes: autoProcessAfterMinutes }
            );

            if (response.status !== 201) {
                throw new RecallrAIError(
                    'Failed to create session',
                    undefined,
                    response.status
                );
            }

            const sessionId = response.data.session_id;
            return new Session(this.http, this.userId, sessionId);
        } catch (error: any) {
            if (error.status === 404) {
                throw new UserNotFoundError(this.userId);
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
            throw new RecallrAIError(`Error retrieving session: ${(error as Error).message}`);
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
    async listSessions(offset: number = 0, limit: number = 10): Promise<SessionList> {
        try {
            const response = await this.http.get(
                `/api/v1/users/${this.userId}/sessions`,
                { params: { offset, limit } }
            );

            return SessionList.fromApiResponse(response.data);
        } catch (error: any) {
            if (error.status === 404) {
                throw new UserNotFoundError(this.userId);
            }
            throw new RecallrAIError(
                `Failed to list sessions: ${error.message || 'Unknown error'}`,
                undefined,
                error.status
            );
        }
    }
}
