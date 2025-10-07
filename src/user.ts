/**
 * User management functionality for the RecallrAI SDK.
 */

import { HTTPClient } from "./utils";
import {
	UserModel,
	SessionModel,
	SessionStatus,
	UserMemoriesList,
	UserMessagesList,
	UserMemoryItem,
	MergeConflictModel,
	MergeConflictStatus,
} from "./models";
import { Session } from "./session";
import { MergeConflict } from "./merge-conflict";
import {
	UserNotFoundError,
	UserAlreadyExistsError,
	InvalidCategoriesError,
	SessionNotFoundError,
	MergeConflictNotFoundError,
	RecallrAIError,
} from "./errors";

/**
 * Represents a user in the RecallrAI system with methods for user management.
 *
 * This class wraps a user object and provides methods for updating user data,
 * and for creating and managing sessions.
 */
export class User {
	private http: HTTPClient;
	private userData: UserModel;

	public userId: string;
	public metadata: Record<string, any>;
	public createdAt: Date;
	public lastActiveAt: Date;

	/**
	 * Initialize a user.
	 *
	 * @param httpClient - HTTP client for API communication.
	 * @param userData - User data model with user information.
	 */
	constructor(httpClient: HTTPClient, userData: UserModel) {
		this.http = httpClient;
		this.userData = userData;
		this.userId = userData.userId;
		this.metadata = userData.metadata;
		this.createdAt = userData.createdAt;
		this.lastActiveAt = userData.lastActiveAt;
	}

	/**
	 * Update this user's metadata or ID.
	 *
	 * @param options - Update options
	 * @param options.newMetadata - New metadata to associate with the user.
	 * @param options.newUserId - New ID for the user.
	 * @throws {UserNotFoundError} If the user is not found.
	 * @throws {UserAlreadyExistsError} If a user with the new_user_id already exists.
	 * @throws {AuthenticationError} If the API key or project ID is invalid.
	 * @throws {InternalServerError} If the server encounters an error.
	 * @throws {NetworkError} If there are network issues.
	 * @throws {TimeoutError} If the request times out.
	 * @throws {RecallrAIError} For other API-related errors.
	 */
	async update(options?: { newMetadata?: Record<string, any>; newUserId?: string }): Promise<void> {
		const data: Record<string, any> = {};
		if (options?.newMetadata !== undefined) {
			data.new_metadata = options.newMetadata;
		}
		if (options?.newUserId !== undefined) {
			data.new_user_id = options.newUserId;
		}

		const response = await this.http.put(`/api/v1/users/${this.userId}`, data);

		if (response.status === 404) {
			const detail = response.data?.detail || `User with ID ${this.userId} not found`;
			throw new UserNotFoundError(detail, response.status);
		} else if (response.status === 409) {
			const detail = response.data?.detail || `User with ID ${options?.newUserId} already exists`;
			throw new UserAlreadyExistsError(detail, response.status);
		} else if (response.status !== 200) {
			throw new RecallrAIError(response.data?.detail || "Unknown error", response.status);
		}

		const updatedData = this.parseUserResponse(response.data);
		this.userData = updatedData;
		this.userId = updatedData.userId;
		this.metadata = updatedData.metadata;
		this.lastActiveAt = updatedData.lastActiveAt;
	}

	/**
	 * Refresh this user's data from the server.
	 *
	 * @throws {UserNotFoundError} If the user is not found.
	 * @throws {AuthenticationError} If the API key or project ID is invalid.
	 * @throws {InternalServerError} If the server encounters an error.
	 * @throws {NetworkError} If there are network issues.
	 * @throws {TimeoutError} If the request times out.
	 * @throws {RecallrAIError} For other API-related errors.
	 */
	async refresh(): Promise<void> {
		const response = await this.http.get(`/api/v1/users/${this.userId}`);

		if (response.status === 404) {
			const detail = response.data?.detail || `User with ID ${this.userId} not found`;
			throw new UserNotFoundError(detail, response.status);
		} else if (response.status !== 200) {
			throw new RecallrAIError(response.data?.detail || "Unknown error", response.status);
		}

		const refreshedData = this.parseUserResponse(response.data);
		this.userData = refreshedData;
		this.userId = refreshedData.userId;
		this.metadata = refreshedData.metadata;
		this.createdAt = refreshedData.createdAt;
		this.lastActiveAt = refreshedData.lastActiveAt;
	}

	/**
	 * Delete this user.
	 *
	 * @throws {UserNotFoundError} If the user is not found.
	 * @throws {AuthenticationError} If the API key or project ID is invalid.
	 * @throws {InternalServerError} If the server encounters an error.
	 * @throws {NetworkError} If there are network issues.
	 * @throws {TimeoutError} If the request times out.
	 * @throws {RecallrAIError} For other API-related errors.
	 */
	async delete(): Promise<void> {
		const response = await this.http.delete(`/api/v1/users/${this.userId}`);

		if (response.status === 404) {
			const detail = response.data?.detail || `User with ID ${this.userId} not found`;
			throw new UserNotFoundError(detail, response.status);
		} else if (response.status !== 204) {
			throw new RecallrAIError(response.data?.detail || "Unknown error", response.status);
		}
	}

	/**
	 * Create a new session for this user.
	 *
	 * @param options - Session creation options
	 * @param options.autoProcessAfterSeconds - Seconds of inactivity allowed before automatically processing the session (min 600).
	 * @param options.metadata - Optional metadata for the session.
	 * @returns A Session object to interact with the created session.
	 * @throws {UserNotFoundError} If the user is not found.
	 * @throws {AuthenticationError} If the API key or project ID is invalid.
	 * @throws {InternalServerError} If the server encounters an error.
	 * @throws {NetworkError} If there are network issues.
	 * @throws {TimeoutError} If the request times out.
	 * @throws {RecallrAIError} For other API-related errors.
	 */
	async createSession(options?: { autoProcessAfterSeconds?: number; metadata?: Record<string, any> }): Promise<Session> {
		const payload: Record<string, any> = {
			auto_process_after_seconds: options?.autoProcessAfterSeconds || 600,
			metadata: options?.metadata || {},
		};

		const response = await this.http.post(`/api/v1/users/${this.userId}/sessions`, payload);

		if (response.status === 404) {
			const detail = response.data?.detail || `User ${this.userId} not found`;
			throw new UserNotFoundError(detail, response.status);
		} else if (response.status !== 201) {
			throw new RecallrAIError(response.data?.detail || "Unknown error", response.status);
		}

		const sessionData = this.parseSessionResponse(response.data);
		return new Session(this.http, this.userId, sessionData);
	}

	/**
	 * Get an existing session for this user.
	 *
	 * @param sessionId - ID of the session to retrieve.
	 * @returns A Session object to interact with the session.
	 * @throws {UserNotFoundError} If the user is not found.
	 * @throws {SessionNotFoundError} If the session is not found.
	 * @throws {AuthenticationError} If the API key or project ID is invalid.
	 * @throws {InternalServerError} If the server encounters an error.
	 * @throws {NetworkError} If there are network issues.
	 * @throws {TimeoutError} If the request times out.
	 * @throws {RecallrAIError} For other API-related errors.
	 */
	async getSession(sessionId: string): Promise<Session> {
		const response = await this.http.get(`/api/v1/users/${this.userId}/sessions/${sessionId}`);

		if (response.status === 404) {
			const detail = response.data?.detail || "";
			if (detail.includes(`User ${this.userId} not found`)) {
				throw new UserNotFoundError(detail, response.status);
			} else {
				throw new SessionNotFoundError(detail, response.status);
			}
		} else if (response.status !== 200) {
			throw new RecallrAIError(response.data?.detail || "Unknown error", response.status);
		}

		const sessionData = this.parseSessionResponse(response.data);
		return new Session(this.http, this.userId, sessionData);
	}

	/**
	 * List sessions for this user with pagination.
	 *
	 * @param options - Listing options
	 * @param options.offset - Number of records to skip.
	 * @param options.limit - Maximum number of records to return.
	 * @param options.metadataFilter - Optional metadata filter for sessions.
	 * @param options.userMetadataFilter - Optional metadata filter for the user.
	 * @param options.statusFilter - Optional list of session statuses to filter by (e.g., ["pending", "processing", "processed", "insufficient_balance"]).
	 * @returns List of sessions with pagination info.
	 * @throws {UserNotFoundError} If the user is not found.
	 * @throws {AuthenticationError} If the API key or project ID is invalid.
	 * @throws {InternalServerError} If the server encounters an error.
	 * @throws {NetworkError} If there are network issues.
	 * @throws {TimeoutError} If the request times out.
	 * @throws {RecallrAIError} For other API-related errors.
	 */
	async listSessions(options?: {
		offset?: number;
		limit?: number;
		metadataFilter?: Record<string, any>;
		userMetadataFilter?: Record<string, any>;
		statusFilter?: SessionStatus[];
	}): Promise<{ sessions: Session[]; total: number; hasMore: boolean }> {
		const params: Record<string, any> = {
			offset: options?.offset || 0,
			limit: options?.limit || 10,
		};

		if (options?.metadataFilter) {
			params.metadata_filter = JSON.stringify(options.metadataFilter);
		}
		if (options?.userMetadataFilter) {
			params.user_metadata_filter = JSON.stringify(options.userMetadataFilter);
		}
		if (options?.statusFilter) {
			params.status_filter = options.statusFilter;
		}

		const response = await this.http.get(`/api/v1/users/${this.userId}/sessions`, params);

		if (response.status === 404) {
			const detail = response.data?.detail || `User ${this.userId} not found`;
			throw new UserNotFoundError(detail, response.status);
		} else if (response.status !== 200) {
			throw new RecallrAIError(response.data?.detail || "Unknown error", response.status);
		}

		return {
			sessions: response.data.sessions.map((session: any) => new Session(this.http, this.userId, this.parseSessionResponse(session))),
			total: response.data.total,
			hasMore: response.data.has_more,
		};
	}

	/**
	 * List memories for this user with optional category filters.
	 *
	 * @param options - Listing options
	 * @param options.offset - Number of records to skip.
	 * @param options.limit - Maximum number of records to return (1-200).
	 * @param options.categories - Optional list of category names to filter by.
	 * @param options.includePreviousVersions - Include full version history for each memory (default: True).
	 * @param options.includeConnectedMemories - Include connected memories (default: True).
	 * @returns UserMemoriesList: Paginated list of memory items.
	 * @throws {UserNotFoundError} If the user is not found.
	 * @throws {AuthenticationError} If the API key or project ID is invalid.
	 * @throws {InternalServerError} If the server encounters an error.
	 * @throws {NetworkError} If there are network issues.
	 * @throws {TimeoutError} If the request times out.
	 * @throws {RecallrAIError} For other API-related errors.
	 */
	async listMemories(options?: {
		offset?: number;
		limit?: number;
		categories?: string[];
		includePreviousVersions?: boolean;
		includeConnectedMemories?: boolean;
	}): Promise<UserMemoriesList> {
		const params: Record<string, any> = {
			offset: options?.offset || 0,
			limit: options?.limit || 20,
			include_previous_versions: options?.includePreviousVersions !== undefined ? options.includePreviousVersions : true,
			include_connected_memories: options?.includeConnectedMemories !== undefined ? options.includeConnectedMemories : true,
		};

		if (options?.categories) {
			params.categories = options.categories;
		}

		const response = await this.http.get(`/api/v1/users/${this.userId}/memories`, params);

		if (response.status === 404) {
			const detail = response.data?.detail || `User ${this.userId} not found`;
			throw new UserNotFoundError(detail, response.status);
		} else if (response.status === 400) {
			const detail = response.data?.detail || "Invalid categories provided";
			throw new InvalidCategoriesError(detail, response.status);
		} else if (response.status !== 200) {
			throw new RecallrAIError(response.data?.detail || "Unknown error", response.status);
		}

		return {
			items: response.data.items.map((item: any) => this.parseMemoryItem(item)),
			total: response.data.total,
			hasMore: response.data.has_more,
		};
	}

	/**
	 * List merge conflicts for this user.
	 *
	 * @param options - Listing options
	 * @param options.offset - Number of records to skip.
	 * @param options.limit - Maximum number of records to return.
	 * @param options.status - Optional filter by conflict status.
	 * @param options.sortBy - Field to sort by (created_at, resolved_at).
	 * @param options.sortOrder - Sort order (asc, desc).
	 * @returns MergeConflictList: Paginated list of merge conflicts.
	 * @throws {UserNotFoundError} If the user is not found.
	 * @throws {AuthenticationError} If the API key or project ID is invalid.
	 * @throws {InternalServerError} If the server encounters an error.
	 * @throws {NetworkError} If there are network issues.
	 * @throws {TimeoutError} If the request times out.
	 * @throws {RecallrAIError} For other API-related errors.
	 */
	async listMergeConflicts(options?: {
		offset?: number;
		limit?: number;
		status?: MergeConflictStatus;
		sortBy?: string;
		sortOrder?: string;
	}): Promise<{ conflicts: MergeConflict[]; total: number; hasMore: boolean }> {
		const params: Record<string, any> = {
			offset: options?.offset || 0,
			limit: options?.limit || 10,
			sort_by: options?.sortBy || "created_at",
			sort_order: options?.sortOrder || "desc",
		};

		if (options?.status) {
			params.status = options.status;
		}

		const response = await this.http.get(`/api/v1/users/${this.userId}/merge-conflicts`, params);

		if (response.status === 404) {
			const detail = response.data?.detail || `User ${this.userId} not found`;
			throw new UserNotFoundError(detail, response.status);
		} else if (response.status !== 200) {
			throw new RecallrAIError(response.data?.detail || "Unknown error", response.status);
		}

		return {
			conflicts: response.data.conflicts.map(
				(conflict: any) => new MergeConflict(this.http, this.userId, this.parseMergeConflictResponse(conflict)),
			),
			total: response.data.total,
			hasMore: response.data.has_more,
		};
	}

	/**
	 * Get a specific merge conflict by ID.
	 *
	 * @param conflictId - Unique identifier of the merge conflict.
	 * @returns MergeConflict: The merge conflict object.
	 * @throws {UserNotFoundError} If the user is not found.
	 * @throws {MergeConflictNotFoundError} If the merge conflict is not found.
	 * @throws {AuthenticationError} If the API key or project ID is invalid.
	 * @throws {InternalServerError} If the server encounters an error.
	 * @throws {NetworkError} If there are network issues.
	 * @throws {TimeoutError} If the request times out.
	 * @throws {RecallrAIError} For other API-related errors.
	 */
	async getMergeConflict(conflictId: string): Promise<MergeConflict> {
		const response = await this.http.get(`/api/v1/users/${this.userId}/merge-conflicts/${conflictId}`);

		if (response.status === 404) {
			const detail = response.data?.detail || "";
			if (detail.includes(`User ${this.userId} not found`)) {
				throw new UserNotFoundError(detail, response.status);
			} else {
				throw new MergeConflictNotFoundError(detail, response.status);
			}
		} else if (response.status !== 200) {
			throw new RecallrAIError(response.data?.detail || "Unknown error", response.status);
		}

		const conflictData = this.parseMergeConflictResponse(response.data);
		return new MergeConflict(this.http, this.userId, conflictData);
	}

	/**
	 * Get the last N messages for this user across all their sessions.
	 *
	 * This method is useful for chatbot applications where you want to see
	 * the recent conversation history for context.
	 *
	 * @param n - Number of recent messages to retrieve (1-100, default: 10).
	 * @returns UserMessagesList: List of the most recent messages.
	 * @throws {UserNotFoundError} If the user is not found.
	 * @throws {AuthenticationError} If the API key or project ID is invalid.
	 * @throws {InternalServerError} If the server encounters an error.
	 * @throws {NetworkError} If there are network issues.
	 * @throws {TimeoutError} If the request times out.
	 * @throws {RecallrAIError} For other API-related errors.
	 * @throws {Error} If n is not between 1 and 100.
	 */
	async getLastNMessages(n: number): Promise<UserMessagesList> {
		if (n < 1 || n > 100) {
			throw new Error("n must be between 1 and 100");
		}

		const response = await this.http.get(`/api/v1/users/${this.userId}/messages`, {
			limit: n,
		});

		if (response.status === 404) {
			const detail = response.data?.detail || `User with ID ${this.userId} not found`;
			throw new UserNotFoundError(detail, response.status);
		} else if (response.status !== 200) {
			throw new RecallrAIError(response.data?.detail || "Unknown error", response.status);
		}

		return {
			messages: response.data.messages.map((msg: any) => ({
				role: msg.role,
				content: msg.content,
				timestamp: new Date(msg.timestamp),
				sessionId: msg.session_id,
			})),
		};
	}

	private parseUserResponse(data: any): UserModel {
		const userData = data.user || data;
		return {
			userId: userData.user_id,
			metadata: userData.metadata || {},
			createdAt: new Date(userData.created_at),
			lastActiveAt: new Date(userData.last_active_at),
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

	private parseMemoryItem(data: any): UserMemoryItem {
		return {
			memoryId: data.memory_id,
			categories: data.categories,
			content: data.content,
			createdAt: new Date(data.created_at),
			versionNumber: data.version_number,
			totalVersions: data.total_versions,
			hasPreviousVersions: data.has_previous_versions,
			previousVersions: data.previous_versions
				? data.previous_versions.map((v: any) => ({
						versionNumber: v.version_number,
						content: v.content,
						createdAt: new Date(v.created_at),
						expiredAt: new Date(v.expired_at),
						expirationReason: v.expiration_reason,
					}))
				: undefined,
			connectedMemories: data.connected_memories
				? data.connected_memories.map((c: any) => ({
						memoryId: c.memory_id,
						content: c.content,
					}))
				: undefined,
			mergeConflictInProgress: data.merge_conflict_in_progress,
			sessionId: data.session_id,
		};
	}

	private parseMergeConflictResponse(data: any): MergeConflictModel {
		const conflictData = data.conflict || data;
		return {
			id: conflictData.id,
			customUserId: conflictData.custom_user_id,
			projectUserSessionId: conflictData.project_user_session_id,
			newMemoryContent: conflictData.new_memory_content,
			conflictingMemories: conflictData.conflicting_memories.map((mem: any) => ({
				content: mem.content,
				reason: mem.reason,
			})),
			clarifyingQuestions: conflictData.clarifying_questions.map((q: any) => ({
				question: q.question,
				options: q.options,
			})),
			status: conflictData.status as MergeConflictStatus,
			resolutionData: conflictData.resolution_data,
			createdAt: new Date(conflictData.created_at),
			resolvedAt: conflictData.resolved_at ? new Date(conflictData.resolved_at) : undefined,
		};
	}

	toString(): string {
		return `<User id=${this.userId} created_at=${this.createdAt} last_active_at=${this.lastActiveAt}>`;
	}
}
