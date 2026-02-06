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

export interface Context {
	context: string;
}
