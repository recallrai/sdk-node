import { userSchema, userListSchema } from './schemas';

/**
 * Represents a user in the RecallrAI system.
 */
export class UserModel {
    /**
     * Unique identifier for the user
     */
    public userId: string;

    /**
     * Custom metadata for the user
     */
    public metadata: Record<string, any>;

    /**
     * When the user was created
     */
    public createdAt: Date;

    /**
     * When the user was last active
     */
    public lastActiveAt: Date;

    /**
     * Creates a new UserModel instance
     * 
     * @param data - User data
     */
    constructor(data: {
        userId: string;
        metadata: Record<string, any>;
        createdAt: Date;
        lastActiveAt: Date;
    }) {
        const validated = userSchema.parse(data);
        this.userId = validated.userId;
        this.metadata = validated.metadata;
        this.createdAt = validated.createdAt;
        this.lastActiveAt = validated.lastActiveAt;
    }

    /**
     * Create a UserModel instance from an API response
     * 
     * @param data - API response data
     * @returns A UserModel instance
     */
    static fromApiResponse(data: any): UserModel {
        const userData = data.user;
        return new UserModel({
            userId: userData.user_id,
            metadata: userData.metadata,
            createdAt: new Date(userData.created_at),
            lastActiveAt: new Date(userData.last_active_at),
        });
    }
}

/**
 * Represents a paginated list of users.
 */
export class UserList {
    /**
     * List of users
     */
    public users: UserModel[];

    /**
     * Total number of users
     */
    public total: number;

    /**
     * Whether there are more users to fetch
     */
    public hasMore: boolean;

    /**
     * Creates a new UserList instance
     * 
     * @param data - User list data
     */
    constructor(data: {
        users: UserModel[];
        total: number;
        hasMore: boolean;
    }) {
        const validated = userListSchema.parse(data);
        this.users = validated.users;
        this.total = validated.total;
        this.hasMore = validated.hasMore;
    }

    /**
     * Create a UserList instance from an API response
     * 
     * @param data - API response data
     * @returns A UserList instance
     */
    static fromApiResponse(data: any): UserList {
        return new UserList({
            users: data.users.map((user: any) => UserModel.fromApiResponse({ user })),
            total: data.total,
            hasMore: data.has_more,
        });
    }
}
