import { 
    messageSchema, 
    sessionSchema, 
    sessionListSchema, 
    contextSchema,
    sessionMessagesListSchema
} from './schemas';
import { HTTPClient } from '../utils/http-client';

/**
 * Message role in a conversation.
 */
export enum MessageRole {
    USER = 'user',
    ASSISTANT = 'assistant',
}

/**
 * Status of a session.
 */
export enum SessionStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    PROCESSED = 'processed',
    INSUFFICIENT_BALANCE = 'insufficient_balance',
}

/**
 * Type of recall strategy.
 */
export enum RecallStrategy {
    LOW_LATENCY = "low_latency",
    BALANCED = "balanced", 
    DEEP = "deep"
}

/**
 * Represents a message in a conversation session.
 */
export class Message {
    /**
     * Role of the message sender (user or assistant)
     */
    public role: MessageRole;

    /**
     * Content of the message
     */
    public content: string;

    /**
     * When the message was sent
     */
    public timestamp: Date;

    /**
     * Creates a new Message instance
     * 
     * @param data - Message data
     */
    constructor(data: {
        role: MessageRole | string;
        content: string;
        timestamp: string | Date;
    }) {
        const parsedData = {
            ...data,
            // Convert string role to enum if needed
            role: typeof data.role === 'string' ? 
                (data.role === 'user' ? MessageRole.USER : MessageRole.ASSISTANT) : data.role,
            timestamp: data.timestamp instanceof Date ? 
                data.timestamp : new Date(data.timestamp)
        };
        
        const validated = messageSchema.parse(parsedData);
        this.role = validated.role;
        this.content = validated.content;
        this.timestamp = validated.timestamp;
    }
}

/**
 * Represents a conversation session.
 */
export class Session {
    /**
     * Unique identifier for the session
     */
    public sessionId: string;

    /**
     * Current status of the session
     */
    public status: SessionStatus;

    /**
     * When the session was created
     */
    public createdAt: Date;

    /**
     * Optional metadata for the session
     */
    public metadata: Record<string, any> = {};

    /**
     * Creates a new Session instance
     * 
     * @param data - Session data
     */
    constructor(data: {
        sessionId: string;
        status: SessionStatus | string;
        createdAt: string | Date;
        metadata?: Record<string, any>;
    }) {
        const parsedData = {
            ...data,
            // Convert string status to enum if needed
            status: typeof data.status === 'string' ? 
                this.mapStatusStringToEnum(data.status) : data.status,
            createdAt: data.createdAt instanceof Date ? 
                data.createdAt : new Date(data.createdAt)
        };
        
        const validated = sessionSchema.parse(parsedData);
        this.sessionId = validated.sessionId;
        this.status = validated.status;
        this.createdAt = validated.createdAt;
        this.metadata = validated.metadata || {};
    }
    
    private mapStatusStringToEnum(status: string): SessionStatus {
        switch (status) {
            case 'pending': return SessionStatus.PENDING;
            case 'processing': return SessionStatus.PROCESSING;
            case 'processed': return SessionStatus.PROCESSED;
            case 'insufficient_balance': return SessionStatus.INSUFFICIENT_BALANCE;
            default: return SessionStatus.PENDING;
        }
    }

    /**
     * Create a Session instance from an API response
     * 
     * @param data - API response data
     * @returns A Session instance
     */
    static fromApiResponse(data: any): Session {
        return new Session({
            sessionId: data.session_id,
            status: data.status,
            createdAt: data.created_at,
            metadata: data.metadata || {},
        });
    }
}

/**
 * Represents a paginated list of sessions.
 */
export class SessionList {
    /**
     * List of session instances (not just Session model data)
     */
    public sessions: any[]; // Will be Session[] from session.ts once imported

    /**
     * Total number of sessions
     */
    public total: number;

    /**
     * Whether there are more sessions to fetch
     */
    public hasMore: boolean;

    /**
     * Creates a new SessionList instance
     * 
     * @param data - Session list data
     */
    constructor(data: {
        sessions: any[];
        total: number;
        hasMore: boolean;
    }) {
        this.sessions = data.sessions;
        this.total = data.total;
        this.hasMore = data.hasMore;
    }

    /**
     * Create a SessionList instance from an API response
     * 
     * @param data - API response data
     * @param userId - User ID who owns the sessions
     * @param httpClient - HTTP client for creating Session instances
     * @returns A SessionList instance
     */
    static fromApiResponse(data: any, userId: string, httpClient: HTTPClient): SessionList {
        // Import Session class dynamically to avoid circular dependency
        const { Session: SessionClass } = require('../session');
        
        return new SessionList({
            sessions: data.sessions.map((session: any) => 
                new SessionClass(httpClient, userId, Session.fromApiResponse(session))
            ),
            total: data.total,
            hasMore: data.has_more,
        });
    }
}

/**
 * Represents the context for a session.
 */
export class Context {
    /**
     * The context for the session
     */
    public context: string;

    /**
     * Creates a new Context instance
     * 
     * @param data - Context data
     */
    constructor(data: {
        context: string;
    }) {
        const validated = contextSchema.parse(data);
        this.context = validated.context;
    }

    /**
     * Create a Context instance from an API response
     * 
     * @param data - API response data
     * @returns A Context instance
     */
    static fromApiResponse(data: any): Context {
        return new Context({
            context: data.context,
        });
    }
}

/**
 * Represents a paginated list of messages in a session.
 */
export class SessionMessagesList {
    /**
     * List of messages in the page
     */
    public messages: Message[];

    /**
     * Total number of messages in the session
     */
    public total: number;

    /**
     * Whether there are more messages to fetch
     */
    public hasMore: boolean;

    constructor(data: { messages: Message[]; total: number; hasMore: boolean; }) {
        // validate counts and booleans; messages already validated individually
        const validated = sessionMessagesListSchema.parse({
            messages: data.messages.map(m => ({ role: m.role, content: m.content, timestamp: m.timestamp })),
            total: data.total,
            hasMore: data.hasMore,
        });
        this.messages = data.messages;
        this.total = validated.total;
        this.hasMore = validated.hasMore;
    }

    /**
     * Create a SessionMessagesList instance from an API response
     */
    static fromApiResponse(data: any): SessionMessagesList {
        return new SessionMessagesList({
            messages: (data.messages || []).map((msg: any) => new Message(msg)),
            total: data.total,
            hasMore: data.has_more,
        });
    }
}
