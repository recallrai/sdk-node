export interface UserModel {
	userId: string;
	metadata: Record<string, any>;
	createdAt: Date;
	lastActiveAt: Date;
}

export interface MemoryVersionInfo {
	versionNumber: number;
	content: string;
	createdAt: Date;
	expiredAt: Date;
	expirationReason: string;
}

export interface MemoryRelationship {
	memoryId: string;
	content: string;
}

export interface UserMemoryItem {
	memoryId: string;
	categories: string[];
	content: string;
	createdAt: Date;
	versionNumber: number;
	totalVersions: number;
	hasPreviousVersions: boolean;
	previousVersions?: MemoryVersionInfo[];
	connectedMemories?: MemoryRelationship[];
	mergeConflictInProgress: boolean;
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
