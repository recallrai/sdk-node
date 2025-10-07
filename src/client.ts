/**
 * Main client class for the RecallrAI SDK.
 *
 * This module provides the RecallrAI class, which is the primary interface for the SDK.
 */

import { HTTPClient } from "./utils";
import { UserModel } from "./models";
import { User } from "./user";
import { UserAlreadyExistsError, UserNotFoundError, RecallrAIError } from "./errors";

/**
 * Main client for interacting with the RecallrAI API.
 *
 * This class provides methods for creating and managing users, sessions, and memories.
 */
export class RecallrAI {
	private http: HTTPClient;

	/**
	 * Initialize the RecallrAI client.
	 *
	 * @param options - Configuration options
	 * @param options.apiKey - Your RecallrAI API key.
	 * @param options.projectId - Your project ID.
	 * @param options.baseUrl - The base URL for the RecallrAI API.
	 * @param options.timeout - Request timeout in seconds.
	 */
	constructor(options: { apiKey: string; projectId: string; baseUrl?: string; timeout?: number }) {
		if (!options.apiKey.startsWith("rai_")) {
			throw new Error("API key must start with 'rai_'");
		}

		this.http = new HTTPClient(options.apiKey, options.projectId, options.baseUrl || "https://api.recallrai.com", options.timeout || 30);
	}

	/**
	 * Create a new user.
	 *
	 * @param userId - Unique identifier for the user.
	 * @param metadata - Optional metadata to associate with the user.
	 * @returns The created user object.
	 * @throws {UserAlreadyExistsError} If a user with the same ID already exists.
	 * @throws {AuthenticationError} If the API key or project ID is invalid.
	 * @throws {InternalServerError} If the server encounters an error.
	 * @throws {NetworkError} If there are network issues.
	 * @throws {TimeoutError} If the request times out.
	 * @throws {RecallrAIError} For other API-related errors.
	 */
	async createUser(userId: string, metadata?: Record<string, any>): Promise<User> {
		const response = await this.http.post("/api/v1/users", {
			user_id: userId,
			metadata: metadata || {},
		});

		if (response.status === 409) {
			const detail = response.data?.detail || `User with ID ${userId} already exists`;
			throw new UserAlreadyExistsError(detail, response.status);
		} else if (response.status !== 201) {
			const detail = response.data?.detail || "Failed to create user";
			throw new RecallrAIError(detail, response.status);
		}

		const userData = this.parseUserResponse(response.data);
		return new User(this.http, userData);
	}

	/**
	 * Get a user by ID.
	 *
	 * @param userId - Unique identifier of the user.
	 * @returns A User object representing the user.
	 * @throws {UserNotFoundError} If the user is not found.
	 * @throws {AuthenticationError} If the API key or project ID is invalid.
	 * @throws {InternalServerError} If the server encounters an error.
	 * @throws {NetworkError} If there are network issues.
	 * @throws {TimeoutError} If the request times out.
	 * @throws {RecallrAIError} For other API-related errors.
	 */
	async getUser(userId: string): Promise<User> {
		const response = await this.http.get(`/api/v1/users/${userId}`);

		if (response.status === 404) {
			const detail = response.data?.detail || `User with ID ${userId} not found`;
			throw new UserNotFoundError(detail, response.status);
		} else if (response.status !== 200) {
			const detail = response.data?.detail || "Failed to retrieve user";
			throw new RecallrAIError(detail, response.status);
		}

		const userData = this.parseUserResponse(response.data);
		return new User(this.http, userData);
	}

	/**
	 * List users with pagination.
	 *
	 * @param options - Listing options
	 * @param options.offset - Number of records to skip.
	 * @param options.limit - Maximum number of records to return.
	 * @param options.metadataFilter - Optional metadata filter for users.
	 * @returns List of users with pagination info.
	 * @throws {AuthenticationError} If the API key or project ID is invalid.
	 * @throws {InternalServerError} If the server encounters an error.
	 * @throws {NetworkError} If there are network issues.
	 * @throws {TimeoutError} If the request times out.
	 * @throws {RecallrAIError} For other API-related errors.
	 */
	async listUsers(options?: {
		offset?: number;
		limit?: number;
		metadataFilter?: Record<string, any>;
	}): Promise<{ users: User[]; total: number; hasMore: boolean }> {
		const params: Record<string, any> = {
			offset: options?.offset || 0,
			limit: options?.limit || 10,
		};

		if (options?.metadataFilter) {
			params.metadata_filter = JSON.stringify(options.metadataFilter);
		}

		const response = await this.http.get("/api/v1/users", params);

		if (response.status !== 200) {
			const detail = response.data?.detail || "Failed to list users";
			throw new RecallrAIError(detail, response.status);
		}

		return {
			users: response.data.users.map((user: any) => new User(this.http, this.parseUserResponse(user))),
			total: response.data.total,
			hasMore: response.data.has_more,
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
}
