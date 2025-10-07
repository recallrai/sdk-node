import { userSchema, userListSchema, userMemoriesListSchema } from './schemas';
import { HTTPClient } from '../utils/http-client';

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
     * List of user instances (not just UserModel data)
     */
    public users: any[]; // Will be User[] once User is imported

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
        users: any[];
        total: number;
        hasMore: boolean;
    }) {
        this.users = data.users;
        this.total = data.total;
        this.hasMore = data.hasMore;
    }

    /**
     * Create a UserList instance from an API response
     * 
     * @param data - API response data
     * @param httpClient - HTTP client for creating User instances
     * @returns A UserList instance
     */
    static fromApiResponse(data: any, httpClient: HTTPClient): UserList {
        // Import User class dynamically to avoid circular dependency
        const { User } = require('../user');
        
        return new UserList({
            users: data.users.map((user: any) => 
                new User(httpClient, UserModel.fromApiResponse({ user }))
            ),
            total: data.total,
            hasMore: data.has_more,
        });
    }
}


/**
 * Information about a specific version of a memory.
 */
export interface MemoryVersionInfo {
    version_number: number;
    content: string;
    created_at: string; // ISO string
    expired_at: string; // ISO string
    expiration_reason: string;
}

/**
 * Connected memory information.
 */
export interface MemoryRelationship {
    memory_id: string;
    content: string;
}

/**
 * Complete memory information with all metadata.
 */
export interface UserMemoryItem {
    memory_id: string;
    categories: string[];
    content: string;
    created_at: string; // ISO string
    
    // Version information
    version_number: number;
    total_versions: number;
    has_previous_versions: boolean;
    
    // Version history (only if requested)
    previous_versions?: MemoryVersionInfo[];
    
    // Relationships (only if requested)
    connected_memories?: MemoryRelationship[];
    
    // Merge conflict info
    merge_conflict_in_progress: boolean;
    
    // Session info
    session_id: string;
}

export class UserMemoriesList {
    public items: UserMemoryItem[];
    public total: number;
    public hasMore: boolean;

    constructor(data: { 
        items: UserMemoryItem[]; 
        total: number; 
        hasMore: boolean 
    }) {
        this.items = data.items;
        this.total = data.total;
        this.hasMore = data.hasMore;
    }

    static fromApiResponse(data: any): UserMemoriesList {
        return new UserMemoriesList({
            items: data.items,
            total: data.total,
            hasMore: data.has_more,
        });
    }
}

/**
 * Represents a single message from a user's conversation history.
 */
export class UserMessage {
    /**
     * Role of the message sender (user or assistant).
     */
    public role: string;

    /**
     * Content of the message.
     */
    public content: string;

    /**
     * When the message was sent.
     */
    public timestamp: Date;

    /**
     * ID of the session this message belongs to.
     */
    public sessionId: string;

    constructor(data: {
        role: string;
        content: string;
        timestamp: Date;
        sessionId: string;
    }) {
        this.role = data.role;
        this.content = data.content;
        this.timestamp = data.timestamp;
        this.sessionId = data.sessionId;
    }

    static fromApiResponse(data: any): UserMessage {
        return new UserMessage({
            role: data.role,
            content: data.content,
            timestamp: new Date(data.timestamp),
            sessionId: data.session_id,
        });
    }
}

/**
 * Represents a list of user messages.
 */
export class UserMessagesList {
    /**
     * List of user messages.
     */
    public messages: UserMessage[];

    constructor(data: {
        messages: UserMessage[];
    }) {
        this.messages = data.messages;
    }

    static fromApiResponse(data: any): UserMessagesList {
        return new UserMessagesList({
            messages: data.messages.map((message: any) => UserMessage.fromApiResponse(message)),
        });
    }
}
