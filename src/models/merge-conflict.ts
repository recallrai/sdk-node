export enum MergeConflictStatus {
	PENDING = "PENDING",
	IN_QUEUE = "IN_QUEUE",
	RESOLVING = "RESOLVING",
	RESOLVED = "RESOLVED",
	FAILED = "FAILED",
}

export interface MergeConflictMemory {
	content: string;
	reason: string;
}

export interface MergeConflictQuestion {
	question: string;
	options: string[];
}

export interface MergeConflictAnswer {
	question: string;
	answer: string;
	message?: string;
}

export interface MergeConflictModel {
	id: string;
	projectUserSessionId: string;
	newMemoryContent: string;
	conflictingMemories: MergeConflictMemory[];
	clarifyingQuestions: MergeConflictQuestion[];
	status: MergeConflictStatus;
	resolutionData?: Record<string, any>;
	createdAt: Date;
	resolvedAt?: Date;
}
