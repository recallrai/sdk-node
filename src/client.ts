/**
 * Main client class for the RecallrAI SDK.
 *
 * This module provides the RecallrAI class, which is the primary interface for the SDK.
 */

import { HTTPClient } from './utils/http-client';
import { User } from './user';
import { UserModel, UserList } from './models/user';
import { 
    UserAlreadyExistsError, 
    UserNotFoundError,
    RecallrAIError
} from './errors';

export interface RecallrAIOptions {
    apiKey: string;
    projectId: string;
    baseUrl?: string;
    timeout?: number;
}

/**
 * Main client for interacting with the RecallrAI API.
 * 
 * This class provides methods for creating and managing users, sessions, and memories.
 */
export class RecallrAI {
    private _http: HTTPClient;

    /**
     * Initialize the RecallrAI client.
     * 
     * @param options Configuration options for the client
     * @param options.apiKey Your RecallrAI API key
     * @param options.projectId Your project ID
     * @param options.baseUrl The base URL for the RecallrAI API (default: 'https://api.recallrai.com')
     * @param options.timeout Request timeout in milliseconds (default: 30000)
     * 
     * @throws {Error} If the API key doesn't start with 'rai_'
     */
    constructor(options: RecallrAIOptions) {
        const { apiKey, projectId, baseUrl = 'https://api.recallrai.com', timeout = 30000 } = options;

        if (!apiKey.startsWith('rai_')) {
            throw new Error('API key must start with "rai_"');
        }

        this._http = new HTTPClient({
            apiKey,
            projectId,
            baseUrl,
            timeout
        });
    }

    /**
     * Create a new user.
     * 
     * @param userId Unique identifier for the user
     * @param metadata Optional metadata to associate with the user
     * @returns The created user object
     * 
     * @throws {UserAlreadyExistsError} If a user with the same ID already exists
     * @throws {AuthenticationError} If the API key or project ID is invalid
     * @throws {InternalServerError} If the server encounters an error
     * @throws {NetworkError} If there are network issues
     * @throws {TimeoutError} If the request times out
     * @throws {RecallrAIError} For other API-related errors
     */
    async createUser(userId: string, metadata?: Record<string, any>): Promise<User> {
        const response = await this._http.post('/api/v1/users', { 
            user_id: userId, 
            metadata: metadata || {} 
        });
        
        if (response.status === 409) {
            const detail = response.data?.detail || `User with ID ${userId} already exists`;
            throw new UserAlreadyExistsError(detail, response.status);
        } else if (response.status !== 201) {
            const detail = response.data?.detail || 'Failed to create user';
            throw new RecallrAIError(detail, response.status);
        }
        
        const userData = UserModel.fromApiResponse(response.data);
        return new User(this._http, userData);
    }

    /**
     * Get a user by ID.
     * 
     * @param userId Unique identifier of the user
     * @returns A User object representing the user
     * 
     * @throws {UserNotFoundError} If the user is not found
     * @throws {AuthenticationError} If the API key or project ID is invalid
     * @throws {InternalServerError} If the server encounters an error
     * @throws {NetworkError} If there are network issues
     * @throws {TimeoutError} If the request times out
     * @throws {RecallrAIError} For other API-related errors
     */
    async getUser(userId: string): Promise<User> {
        const response = await this._http.get(`/api/v1/users/${userId}`);
        
        if (response.status === 404) {
            const detail = response.data?.detail || `User with ID ${userId} not found`;
            throw new UserNotFoundError(detail, response.status);
        } else if (response.status !== 200) {
            const detail = response.data?.detail || 'Failed to retrieve user';
            throw new RecallrAIError(detail, response.status);
        }
        
        const userData = UserModel.fromApiResponse(response.data);
        return new User(this._http, userData);
    }

    /**
     * List users with pagination.
     * 
     * @param offset Number of records to skip (default: 0)
     * @param limit Maximum number of records to return (default: 10)
     * @param metadataFilter Optional metadata filter for users
     * @returns List of users with pagination info
     * 
     * @throws {AuthenticationError} If the API key or project ID is invalid
     * @throws {InternalServerError} If the server encounters an error
     * @throws {NetworkError} If there are network issues
     * @throws {TimeoutError} If the request times out
     * @throws {RecallrAIError} For other API-related errors
     */
    async listUsers(
        offset: number = 0, 
        limit: number = 10, 
        metadataFilter?: Record<string, any>
    ): Promise<UserList> {
        const params: Record<string, any> = { offset, limit };
        
        if (metadataFilter !== undefined) {
            params.metadata_filter = JSON.stringify(metadataFilter);
        }

        const response = await this._http.get('/api/v1/users', { params });
        
        if (response.status !== 200) {
            const detail = response.data?.detail || 'Failed to list users';
            throw new RecallrAIError(detail, response.status);
        }
        
        return UserList.fromApiResponse(response.data, this._http);
    }
}
