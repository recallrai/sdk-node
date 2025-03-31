import { 
    messageSchema, 
    sessionSchema, 
    sessionListSchema, 
    contextSchema 
} from './schemas';

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
     * Creates a new Session instance
     * 
     * @param data - Session data
     */
    constructor(data: {
        sessionId: string;
        status: SessionStatus | string;
        createdAt: string | Date;
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
    }
    
    private mapStatusStringToEnum(status: string): SessionStatus {
        switch (status) {
            case 'pending': return SessionStatus.PENDING;
            case 'processing': return SessionStatus.PROCESSING;
            case 'processed': return SessionStatus.PROCESSED;
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
        });
    }
}

/**
 * Represents a paginated list of sessions.
 */
export class SessionList {
    /**
     * List of sessions
     */
    public sessions: Session[];

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
        sessions: Session[];
        total: number;
        hasMore: boolean;
    }) {
        // We'll validate separately to avoid type issues
        const { total, hasMore } = sessionListSchema.parse(data);
        
        this.sessions = data.sessions;
        this.total = total;
        this.hasMore = hasMore;
    }

    /**
     * Create a SessionList instance from an API response
     * 
     * @param data - API response data
     * @returns A SessionList instance
     */
    static fromApiResponse(data: any): SessionList {
        return new SessionList({
            sessions: data.sessions.map((session: any) => Session.fromApiResponse(session)),
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
     * Whether memory was used to generate the context
     */
    public memoryUsed: boolean;

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
        memoryUsed: boolean;
        context: string;
    }) {
        const validated = contextSchema.parse(data);
        this.memoryUsed = validated.memoryUsed;
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
            memoryUsed: data.memory_used,
            context: data.context,
        });
    }
}
