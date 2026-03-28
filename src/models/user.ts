import type { Unavailable } from "./unavailable";

export interface UserModel {
	userId: string;
	metadata: Record<string, any> | Unavailable;
	mergeConflictEnabled?: boolean | Unavailable;
	createdAt: Date | Unavailable;
	lastActiveAt: Date | Unavailable;
}

export interface MemoryVersionInfo {
	memoryId: string;
	versionNumber: number;
	content: string;
	eventDateStart: Date;
	eventDateEnd: Date;
	createdAt: Date;
	expiredAt: Date;
	expirationReason: string;
	mergeConflictId?: string | null;
}

export interface MemoryRelationship {
	memoryId: string;
	content: string;
}

export interface UserMemoryItem {
	memoryId: string;
	categories: string[];
	content: string;
	eventDateStart: Date;
	eventDateEnd: Date;
	createdAt: Date;
	expiredAt?: Date;
	expirationReason?: string;
	versionNumber: number;
	totalVersions: number;
	hasPreviousVersions: boolean;
	previousVersions?: MemoryVersionInfo[];
	connectedMemories?: MemoryRelationship[];
	mergeConflictInProgress: boolean;
	mergeConflictId?: string | null;
	sessionId: string;
}

export interface UserMemoriesList {
	items: UserMemoryItem[];
	total: number;
	hasMore: boolean;
}

export interface UserMessage {
	role: string;
	content: string;
	timestamp: Date;
	sessionId: string;
}

export interface UserMessagesList {
	messages: UserMessage[];
}
