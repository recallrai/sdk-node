import { HTTPClient } from './utils/http-client';
import { User } from './user';
import { UserModel, UserList } from './models/user';
import { UserAlreadyExistsError, UserNotFoundError, RecallrAIError } from './errors';

export interface RecallrAIOptions {
    apiKey: string;
    projectId: string;
    baseUrl?: string;
    timeout?: number;
}

export class RecallrAI {
    private http: HTTPClient;
    private apiKey: string;
    private projectId: string;
    private baseUrl: string;

    /**
     * Initialize the RecallrAI client.
     * 
     * @param options Configuration options for the client
     */
    constructor(options: RecallrAIOptions) {
        const { apiKey, projectId, baseUrl = 'https://api.recallrai.com', timeout = 30000 } = options;

        if (!apiKey.startsWith('rai_')) {
            throw new Error('API key must start with "rai_"');
        }

        this.apiKey = apiKey;
        this.projectId = projectId;
        this.baseUrl = baseUrl;

        this.http = new HTTPClient({
            apiKey: this.apiKey,
            projectId: this.projectId,
            baseUrl: this.baseUrl,
            timeout
        });
    }

    /**
     * Create a new user.
     * 
     * @param userId Unique identifier for the user
     * @param metadata Optional metadata to associate with the user
     * @returns The created user object
     * @throws {UserAlreadyExistsError} If a user with the same ID already exists
     */
    async createUser(userId: string, metadata: Record<string, any> = {}): Promise<User> {
        try {
            const response = await this.http.post('/api/v1/users', { user_id: userId, metadata });
            const userData = UserModel.fromApiResponse(response.data);
            return new User(this.http, userData);
        } catch (error: any) {
            if (error.status === 409) {
                throw new UserAlreadyExistsError(userId);
            }
            throw error;
        }
    }

    /**
     * Get a user by ID.
     * 
     * @param userId Unique identifier of the user
     * @returns A User object representing the user
     * @throws {UserNotFoundError} If the user is not found
     */
    async getUser(userId: string): Promise<User> {
        try {
            const response = await this.http.get(`/api/v1/users/${userId}`);
            const userData = UserModel.fromApiResponse(response.data);
            return new User(this.http, userData);
        } catch (error: any) {
            if (error.status === 404) {
                throw new UserNotFoundError(userId);
            }
            throw error;
        }
    }

    /**
     * List users with pagination.
     * 
     * @param offset Number of records to skip
     * @param limit Maximum number of records to return
     * @returns List of users with pagination info
     */
    async listUsers(offset: number = 0, limit: number = 10): Promise<UserList> {
        try {
            const response = await this.http.get('/api/v1/users', { params: { offset, limit } });
            return UserList.fromApiResponse(response.data);
        } catch (error) {
            // throw new RecallrAIError('Failed to list users', undefined, (error as any).status);
            throw error;
        }
    }
}
