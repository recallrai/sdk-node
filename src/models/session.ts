export enum MessageRole {
	USER = "user",
	ASSISTANT = "assistant",
}

export interface Message {
	role: MessageRole;
	content: string;
	timestamp: Date;
}

export interface SessionMessagesList {
	messages: Message[];
	total: number;
	hasMore: boolean;
}

export enum SessionStatus {
	PENDING = "pending",
	PROCESSING = "processing",
	PROCESSED = "processed",
	FAILED = "failed",
	INSUFFICIENT_BALANCE = "insufficient_balance",
}

export interface SessionModel {
	sessionId: string;
	status: SessionStatus;
	createdAt: Date;
	metadata: Record<string, any>;
}

export enum RecallStrategy {
	LOW_LATENCY = "low_latency",
	BALANCED = "balanced",
	AGENTIC = "agentic",
	AUTO = "auto",
}

export enum DateRangeFilterType {
	EVENT_DATE = "event_date",
	CREATED_AT = "created_at",
}

export interface QueryDateRangeFilter {
	filterType: DateRangeFilterType;
	startDate: string;
	endDate: string;
}

export interface ContextMetadata {
	memoryIds?: string[];
	sessionIds?: string[];
	agentReasoning?: string; // Only populated for agentic recall strategy
	vectorSearchQueries?: string[];
	keywords?: string[];
	sessionSummariesSearchQueries?: string[];
	dateRangeFilters?: QueryDateRangeFilter[];
}

export interface ContextResponse {
	isFinal: boolean;
	statusUpdateMessage?: string;
	errorMessage?: string;
	context?: string;
	metadata?: ContextMetadata;
}
