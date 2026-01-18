export enum MergeConflictStatus {
	PENDING = "PENDING",
	IN_QUEUE = "IN_QUEUE",
	RESOLVING = "RESOLVING",
	RESOLVED = "RESOLVED",
	FAILED = "FAILED",
}

export interface MergeConflictConflictingMemory {
	memoryId: string;
	content: string;
	reason: string;
	eventDateStart: Date;
	eventDateEnd: Date;
	createdAt: Date;
}

export interface MergeConflictNewMemory {
	memoryId: string;
	content: string;
	eventDateStart: Date;
	eventDateEnd: Date;
	createdAt: Date;
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
	newMemoryContent?: string;
	newMemories?: MergeConflictNewMemory[];
	conflictingMemories: MergeConflictConflictingMemory[];
	clarifyingQuestions: MergeConflictQuestion[];
	status: MergeConflictStatus;
	resolutionData?: Record<string, any>;
	createdAt: Date;
	resolvedAt?: Date;
}
