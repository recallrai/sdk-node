/**
 * Session management functionality for the RecallrAI SDK.
 */

import { HTTPClient } from "./utils";
import { Context, SessionMessagesList, SessionModel, SessionStatus, MessageRole, RecallStrategy } from "./models";
import { UserNotFoundError, SessionNotFoundError, InvalidSessionStateError, RecallrAIError } from "./errors";

/**
 * Manages a conversation session with RecallrAI.
 *
 * This class handles adding messages, retrieving context, and processing the session
 * to update the user's memory.
 */
export class Session {
	private http: HTTPClient;
	private sessionData: SessionModel;
	private _userId: string;

	public sessionId: string;
	public status: SessionStatus;
	public createdAt: Date;
	public metadata: Record<string, any>;

	/**
	 * Initialize a session.
	 *
	 * @param httpClient - HTTP client for API communication.
	 * @param userId - ID of the user who owns this session.
	 * @param sessionData - Initial session data from the API.
	 */
	constructor(httpClient: HTTPClient, userId: string, sessionData: SessionModel) {
		this.http = httpClient;
		this._userId = userId;
		this.sessionData = sessionData;
		this.sessionId = sessionData.sessionId;
		this.status = sessionData.status;
		this.createdAt = sessionData.createdAt;
		this.metadata = sessionData.metadata;
	}

	/**
	 * Internal helper to add a message to the session.
	 *
	 * @param role - Role of the message sender.
	 * @param content - Content of the message.
	 * @throws {UserNotFoundError} If the user is not found.
	 * @throws {SessionNotFoundError} If the session is not found.
	 * @throws {InvalidSessionStateError} If the session is already processed or processing.
	 * @throws {AuthenticationError} If the API key or project ID is invalid.
	 * @throws {InternalServerError} If the server encounters an error.
	 * @throws {NetworkError} If there are network issues.
	 * @throws {TimeoutError} If the request times out.
	 * @throws {RecallrAIError} For other API-related errors.
	 */
	async addMessage(role: MessageRole, content: string): Promise<void> {
		const response = await this.http.post(`/api/v1/users/${this._userId}/sessions/${this.sessionId}/add-message`, { message: content, role });

		if (response.status === 404) {
			const detail = response.data?.detail || "";
			if (detail.includes(`User ${this._userId} not found`)) {
				throw new UserNotFoundError(detail, response.status);
			} else {
				throw new SessionNotFoundError(detail, response.status);
			}
		} else if (response.status === 400) {
			const detail = response.data?.detail || `Cannot add message to session with status ${this.status}`;
			throw new InvalidSessionStateError(detail, response.status);
		} else if (response.status !== 200) {
			throw new RecallrAIError(response.data?.detail || "Unknown error", response.status);
		}
	}

	/**
	 * Get the current context for this session.
	 *
	 * @param options - Context retrieval options
	 * @param options.recallStrategy - The type of recall strategy to use.
	 * @param options.minTopK - Minimum number of memories to return.
	 * @param options.maxTopK - Maximum number of memories to return.
	 * @param options.memoriesThreshold - Similarity threshold for memories.
	 * @param options.summariesThreshold - Similarity threshold for summaries.
	 * @param options.lastNMessages - Number of last messages to include in context.
	 * @param options.lastNSummaries - Number of last summaries to include in context.
	 * @param options.timezone - Timezone for formatting timestamps (e.g., 'America/New_York'). None for UTC.
	 * @param options.includeSystemPrompt - Whether to include the default system prompt of Recallr AI. Defaults to True.
	 * @returns Context information with the memory text and whether memory was used.
	 * @throws {UserNotFoundError} If the user is not found.
	 * @throws {SessionNotFoundError} If the session is not found.
	 * @throws {AuthenticationError} If the API key or project ID is invalid.
	 * @throws {InternalServerError} If the server encounters an error.
	 * @throws {NetworkError} If there are network issues.
	 * @throws {TimeoutError} If the request times out.
	 * @throws {RecallrAIError} For other API-related errors.
	 */
	async getContext(options?: {
		recallStrategy?: RecallStrategy;
		minTopK?: number;
		maxTopK?: number;
		memoriesThreshold?: number;
		summariesThreshold?: number;
		lastNMessages?: number;
		lastNSummaries?: number;
		includeSystemPrompt?: boolean;
	}): Promise<Context> {
		const params: Record<string, any> = {
			recall_strategy: options?.recallStrategy || RecallStrategy.BALANCED,
			min_top_k: options?.minTopK || 15,
			max_top_k: options?.maxTopK || 50,
			memories_threshold: options?.memoriesThreshold || 0.6,
			summaries_threshold: options?.summariesThreshold || 0.5,
			include_system_prompt: options?.includeSystemPrompt !== undefined ? options.includeSystemPrompt : true,
		};

		if (options?.lastNMessages !== undefined) {
			params.last_n_messages = options.lastNMessages;
		}
		if (options?.lastNSummaries !== undefined) {
			params.last_n_summaries = options.lastNSummaries;
		}

		const response = await this.http.get(`/api/v1/users/${this._userId}/sessions/${this.sessionId}/context`, params);

		if (response.status === 404) {
			const detail = response.data?.detail || "";
			if (detail.includes(`User ${this._userId} not found`)) {
				throw new UserNotFoundError(detail, response.status);
			} else {
				throw new SessionNotFoundError(detail, response.status);
			}
		} else if (response.status !== 200) {
			throw new RecallrAIError(response.data?.detail || "Unknown error", response.status);
		}

		if (this.status === SessionStatus.PROCESSED) {
			console.warn("You are trying to get context for a processed session. Why do you need it?");
		} else if (this.status === SessionStatus.PROCESSING) {
			console.warn("You are trying to get context for a processing session. Why do you need it?");
		}

		return {
			context: response.data.context,
		};
	}

	/**
	 * Update the session's metadata.
	 *
	 * @param newMetadata - New metadata to associate with the session.
	 * @throws {UserNotFoundError} If the user is not found.
	 * @throws {SessionNotFoundError} If the session is not found.
	 * @throws {AuthenticationError} If the API key or project ID is invalid.
	 * @throws {InternalServerError} If the server encounters an error.
	 * @throws {NetworkError} If there are network issues.
	 * @throws {TimeoutError} If the request times out.
	 * @throws {RecallrAIError} For other API-related errors.
	 */
	async update(newMetadata?: Record<string, any>): Promise<void> {
		const response = await this.http.put(`/api/v1/users/${this._userId}/sessions/${this.sessionId}`, { new_metadata: newMetadata });

		if (response.status === 404) {
			const detail = response.data?.detail || "";
			if (detail.includes(`User ${this._userId} not found`)) {
				throw new UserNotFoundError(detail, response.status);
			} else {
				throw new SessionNotFoundError(detail, response.status);
			}
		} else if (response.status !== 200) {
			throw new RecallrAIError(response.data?.detail || "Unknown error", response.status);
		}

		const updatedData = this.parseSessionResponse(response.data);
		this.metadata = updatedData.metadata;
	}

	/**
	 * Refresh the session data from the API.
	 *
	 * This method updates the local session data to reflect any changes
	 * that may have occurred on the server.
	 *
	 * @throws {UserNotFoundError} If the user is not found.
	 * @throws {SessionNotFoundError} If the session is not found.
	 * @throws {AuthenticationError} If the API key or project ID is invalid.
	 * @throws {InternalServerError} If the server encounters an error.
	 * @throws {NetworkError} If there are network issues.
	 * @throws {TimeoutError} If the request times out.
	 * @throws {RecallrAIError} For other API-related errors.
	 */
	async refresh(): Promise<void> {
		const response = await this.http.get(`/api/v1/users/${this._userId}/sessions/${this.sessionId}`);

		if (response.status === 404) {
			const detail = response.data?.detail || "";
			if (detail.includes(`User ${this._userId} not found`)) {
				throw new UserNotFoundError(detail, response.status);
			} else {
				throw new SessionNotFoundError(detail, response.status);
			}
		} else if (response.status !== 200) {
			throw new RecallrAIError(response.data?.detail || "Unknown error", response.status);
		}

		this.sessionData = this.parseSessionResponse(response.data);
		this.status = this.sessionData.status;
		this.createdAt = this.sessionData.createdAt;
		this.metadata = this.sessionData.metadata;
	}

	/**
	 * Process the session to update the user's memory.
	 *
	 * This method triggers the processing of the conversation to extract and update
	 * the user's memory.
	 *
	 * @throws {UserNotFoundError} If the user is not found.
	 * @throws {SessionNotFoundError} If the session is not found.
	 * @throws {InvalidSessionStateError} If the session is already processed or being processed.
	 * @throws {AuthenticationError} If the API key or project ID is invalid.
	 * @throws {InternalServerError} If the server encounters an error.
	 * @throws {NetworkError} If there are network issues.
	 * @throws {TimeoutError} If the request times out.
	 * @throws {RecallrAIError} For other API-related errors.
	 */
	async process(): Promise<void> {
		const response = await this.http.post(`/api/v1/users/${this._userId}/sessions/${this.sessionId}/process`);

		if (response.status === 404) {
			const detail = response.data?.detail || "";
			if (detail.includes(`User ${this._userId} not found`)) {
				throw new UserNotFoundError(detail, response.status);
			} else {
				throw new SessionNotFoundError(detail, response.status);
			}
		} else if (response.status === 400) {
			const detail = response.data?.detail || `Cannot process session with status ${this.status}`;
			throw new InvalidSessionStateError(detail, response.status);
		} else if (response.status !== 200) {
			throw new RecallrAIError(response.data?.detail || "Unknown error", response.status);
		}
	}

	/**
	 * Get all messages in the session.
	 *
	 * @param offset - Number of records to skip.
	 * @param limit - Maximum number of records to return.
	 * @returns Paginated list of messages in the session.
	 * @throws {UserNotFoundError} If the user is not found.
	 * @throws {SessionNotFoundError} If the session is not found.
	 * @throws {AuthenticationError} If the API key or project ID is invalid.
	 * @throws {InternalServerError} If the server encounters an error.
	 * @throws {NetworkError} If there are network issues.
	 * @throws {TimeoutError} If the request times out.
	 * @throws {RecallrAIError} For other API-related errors.
	 */
	async getMessages(offset: number = 0, limit: number = 50): Promise<SessionMessagesList> {
		const response = await this.http.get(`/api/v1/users/${this._userId}/sessions/${this.sessionId}/messages`, { offset, limit });

		if (response.status === 404) {
			const detail = response.data?.detail || "";
			if (detail.includes(`User ${this._userId} not found`)) {
				throw new UserNotFoundError(detail, response.status);
			} else {
				throw new SessionNotFoundError(detail, response.status);
			}
		} else if (response.status !== 200) {
			throw new RecallrAIError(response.data?.detail || "Unknown error", response.status);
		}

		return {
			messages: response.data.messages.map((msg: any) => ({
				role: msg.role as MessageRole,
				content: msg.content,
				timestamp: new Date(msg.timestamp),
			})),
			total: response.data.total,
			hasMore: response.data.has_more,
		};
	}

	private parseSessionResponse(data: any): SessionModel {
		const sessionData = data.session || data;
		return {
			sessionId: sessionData.session_id,
			status: sessionData.status as SessionStatus,
			createdAt: new Date(sessionData.created_at),
			metadata: sessionData.metadata,
		};
	}

	toString(): string {
		return `<Session id=${this.sessionId} user_id=${this._userId} status=${this.status}>`;
	}
}
