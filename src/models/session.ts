export enum MessageRole {
    USER = 'user',
    ASSISTANT = 'assistant',
}

export enum SessionStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    PROCESSED = 'processed',
}

export class Message {
    public role: MessageRole;
    public content: string;
    public timestamp: Date;

    constructor(data: {
        role: MessageRole | string;
        content: string;
        timestamp: string | Date;
    }) {
        this.role = data.role as MessageRole;
        this.content = data.content;
        this.timestamp = data.timestamp instanceof Date ?
            data.timestamp : new Date(data.timestamp);
    }
}

export class Session {
    public sessionId: string;
    public status: SessionStatus;
    public createdAt: Date;

    constructor(data: {
        sessionId: string;
        status: SessionStatus | string;
        createdAt: string | Date;
    }) {
        this.sessionId = data.sessionId;
        this.status = data.status as SessionStatus;
        this.createdAt = data.createdAt instanceof Date ?
            data.createdAt : new Date(data.createdAt);
    }

    static fromApiResponse(data: any): Session {
        return new Session({
            sessionId: data.session_id,
            status: data.status || SessionStatus.PENDING,
            createdAt: data.created_at || new Date(),
        });
    }
}

export class SessionList {
    public sessions: Session[];
    public total: number;
    public hasMore: boolean;

    constructor(data: {
        sessions: Session[];
        total: number;
        hasMore: boolean;
    }) {
        this.sessions = data.sessions;
        this.total = data.total;
        this.hasMore = data.hasMore;
    }

    static fromApiResponse(data: any): SessionList {
        return new SessionList({
            sessions: data.sessions.map((session: any) => Session.fromApiResponse(session)),
            total: data.total,
            hasMore: data.has_more,
        });
    }
}

export class Context {
    public memoryUsed: boolean;
    public context: string;

    constructor(data: {
        memoryUsed: boolean;
        context: string;
    }) {
        this.memoryUsed = data.memoryUsed;
        this.context = data.context;
    }

    static fromApiResponse(data: any): Context {
        return new Context({
            memoryUsed: data.memory_used,
            context: data.context,
        });
    }
}
