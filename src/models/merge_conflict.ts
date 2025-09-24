/**
 * Merge conflict-related data models for the RecallrAI SDK.
 */

/**
 * Status of a merge conflict.
 */
export enum MergeConflictStatus {
    PENDING = "PENDING",
    IN_QUEUE = "IN_QUEUE", 
    RESOLVING = "RESOLVING",
    RESOLVED = "RESOLVED",
    FAILED = "FAILED"
}

/**
 * Represents a memory involved in a merge conflict.
 */
export class MergeConflictMemory {
    /**
     * Content of the conflicting memory.
     */
    public content: string;

    /**
     * Reason why this memory conflicts.
     */
    public reason: string;

    constructor(data: {
        content: string;
        reason: string;
    }) {
        this.content = data.content;
        this.reason = data.reason;
    }

    static fromApiResponse(data: any): MergeConflictMemory {
        return new MergeConflictMemory({
            content: data.content,
            reason: data.reason,
        });
    }
}

/**
 * Represents a clarifying question for merge conflict resolution.
 */
export class MergeConflictQuestion {
    /**
     * The clarifying question.
     */
    public question: string;

    /**
     * Available answer options.
     */
    public options: string[];

    constructor(data: {
        question: string;
        options: string[];
    }) {
        this.question = data.question;
        this.options = data.options;
    }

    static fromApiResponse(data: any): MergeConflictQuestion {
        return new MergeConflictQuestion({
            question: data.question,
            options: data.options,
        });
    }
}

/**
 * Represents an answer to a clarifying question.
 */
export class MergeConflictAnswer {
    /**
     * The question being answered.
     */
    public question: string;

    /**
     * The selected answer.
     */
    public answer: string;

    /**
     * Optional additional message.
     */
    public message?: string;

    constructor(data: {
        question: string;
        answer: string;
        message?: string;
    }) {
        this.question = data.question;
        this.answer = data.answer;
        this.message = data.message;
    }
}

/**
 * Represents a merge conflict in the RecallrAI system.
 */
export class MergeConflictModel {
    /**
     * Unique identifier for the merge conflict.
     */
    public id: string;

    /**
     * User ID who owns this conflict.
     */
    public customUserId: string;

    /**
     * Session ID where the conflict occurred.
     */
    public projectUserSessionId: string;

    /**
     * New memory content that caused the conflict.
     */
    public newMemoryContent: string;

    /**
     * Existing memories that conflict.
     */
    public conflictingMemories: MergeConflictMemory[];

    /**
     * Questions to resolve the conflict.
     */
    public clarifyingQuestions: MergeConflictQuestion[];

    /**
     * Current status of the conflict.
     */
    public status: MergeConflictStatus;

    /**
     * Resolution data if resolved.
     */
    public resolutionData?: Record<string, any>;

    /**
     * When the conflict was created.
     */
    public createdAt: Date;

    /**
     * When the conflict was resolved.
     */
    public resolvedAt?: Date;

    constructor(data: {
        id: string;
        customUserId: string;
        projectUserSessionId: string;
        newMemoryContent: string;
        conflictingMemories: MergeConflictMemory[];
        clarifyingQuestions: MergeConflictQuestion[];
        status: MergeConflictStatus;
        resolutionData?: Record<string, any>;
        createdAt: Date;
        resolvedAt?: Date;
    }) {
        this.id = data.id;
        this.customUserId = data.customUserId;
        this.projectUserSessionId = data.projectUserSessionId;
        this.newMemoryContent = data.newMemoryContent;
        this.conflictingMemories = data.conflictingMemories;
        this.clarifyingQuestions = data.clarifyingQuestions;
        this.status = data.status;
        this.resolutionData = data.resolutionData;
        this.createdAt = data.createdAt;
        this.resolvedAt = data.resolvedAt;
    }

    static fromApiResponse(data: any): MergeConflictModel {
        return new MergeConflictModel({
            id: data.id,
            customUserId: data.custom_user_id,
            projectUserSessionId: data.project_user_session_id,
            newMemoryContent: data.new_memory_content,
            conflictingMemories: data.conflicting_memories.map((memory: any) => 
                MergeConflictMemory.fromApiResponse(memory)
            ),
            clarifyingQuestions: data.clarifying_questions.map((question: any) =>
                MergeConflictQuestion.fromApiResponse(question)
            ),
            status: data.status as MergeConflictStatus,
            resolutionData: data.resolution_data,
            createdAt: new Date(data.created_at),
            resolvedAt: data.resolved_at ? new Date(data.resolved_at) : undefined,
        });
    }
}

/**
 * Represents a paginated list of merge conflicts.
 */
export class MergeConflictList {
    /**
     * List of merge conflicts.
     */
    public conflicts: MergeConflictModel[];

    /**
     * Total number of merge conflicts.
     */
    public total: number;

    /**
     * Whether there are more merge conflicts to fetch.
     */
    public hasMore: boolean;

    constructor(data: {
        conflicts: MergeConflictModel[];
        total: number;
        hasMore: boolean;
    }) {
        this.conflicts = data.conflicts;
        this.total = data.total;
        this.hasMore = data.hasMore;
    }

    static fromApiResponse(data: any): MergeConflictList {
        return new MergeConflictList({
            conflicts: data.conflicts.map((conflict: any) =>
                MergeConflictModel.fromApiResponse(conflict)
            ),
            total: data.total,
            hasMore: data.has_more,
        });
    }
}