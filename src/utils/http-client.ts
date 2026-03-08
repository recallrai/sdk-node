/**
 * HTTP client for making requests to the RecallrAI API.
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import { TimeoutError, ConnectionError, ValidationError, InternalServerError, AuthenticationError, RateLimitError } from "../errors";

/**
 * HTTP client for making requests to the RecallrAI API.
 */
export class HTTPClient {
	private client: AxiosInstance;
	private apiKey: string;
	private projectId: string;
	private baseUrl: string;
	private timeout: number;
	private _systemPromptCache: string | null = null;
	private _systemPromptCacheExpiresAt: number = 0;

	/**
	 * Initialize the HTTP client.
	 *
	 * @param apiKey - Your RecallrAI API key.
	 * @param projectId - Your project ID.
	 * @param baseUrl - The base URL for the RecallrAI API.
	 * @param timeout - Request timeout in seconds.
	 */
	constructor(apiKey: string, projectId: string, baseUrl: string, timeout: number = 30) {
		this.apiKey = apiKey;
		this.projectId = projectId;
		this.baseUrl = baseUrl.replace(/\/$/, "");
		this.timeout = timeout * 1000;

		this.client = axios.create({
			timeout: this.timeout,
			validateStatus: () => true,
			headers: {
				"X-Recallr-Api-Key": this.apiKey,
				"X-Recallr-Project-Id": this.projectId,
				"Content-Type": "application/json",
				"Accept": "application/json",
				"User-Agent": "RecallrAI-Node-SDK/0.4.0",
			},
		});
	}

	/**
	 * Filter out null and undefined values from params.
	 */
	private filterParams(params?: Record<string, any>): Record<string, any> {
		if (!params) return {};
		const filtered: Record<string, any> = {};
		for (const [key, value] of Object.entries(params)) {
			if (value !== null && value !== undefined) {
				filtered[key] = value;
			}
		}
		return filtered;
	}

	/**
	 * Filter out null and undefined values from data.
	 */
	private filterData(data?: Record<string, any>): Record<string, any> {
		if (!data) return {};
		const filtered: Record<string, any> = {};
		for (const [key, value] of Object.entries(data)) {
			if (value !== null && value !== undefined) {
				filtered[key] = value;
			}
		}
		return filtered;
	}

	/**
	 * Make a request to the RecallrAI API.
	 *
	 * @param method - HTTP method (GET, POST, PUT, DELETE).
	 * @param path - API endpoint path.
	 * @param params - Query parameters.
	 * @param data - Request body data.
	 * @returns The parsed JSON response.
	 */
	async request(method: string, path: string, params?: Record<string, any>, data?: Record<string, any>): Promise<AxiosResponse> {
		const url = `${this.baseUrl}${path}`;
		const filteredParams = this.filterParams(params);
		const filteredData = this.filterData(data);

		try {
			const response = await this.client.request({
				method,
				url,
				params: filteredParams,
				data: filteredData,
			});

			if (response.status === 422) {
				const detail = response.data?.detail || "Validation error";
				throw new ValidationError(detail, response.status);
			} else if (response.status === 500) {
				const detail = response.data?.detail || "Internal server error";
				throw new InternalServerError(detail, response.status);
			} else if (response.status === 404 && response.data === "404 page not found") {
				throw new ConnectionError("Resource not found", response.status);
			} else if (response.status === 401) {
				const detail = response.data?.detail || "Authentication failed";
				throw new AuthenticationError(detail, response.status);
			} else if (response.status === 429) {
				const detail = response.data?.detail || "Please try again in a few moments.";
				throw new RateLimitError(detail, response.status);
			}

			return response;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				const axiosError = error as AxiosError;

				if (axiosError.code === "ECONNABORTED" || axiosError.message.includes("timeout")) {
					throw new TimeoutError(`Request timed out: ${axiosError.message}`, 0);
				}

				if (axiosError.code === "ECONNREFUSED" || axiosError.code === "ENOTFOUND") {
					throw new ConnectionError(`Failed to connect to the API: ${axiosError.message}`, 0);
				}
			}
			throw error;
		}
	}

	/**
	 * Make a GET request.
	 */
	async get(path: string, params?: Record<string, any>): Promise<AxiosResponse> {
		return this.request("GET", path, params);
	}

	/**
	 * Make a POST request.
	 */
	async post(path: string, data?: Record<string, any>): Promise<AxiosResponse> {
		return this.request("POST", path, undefined, data);
	}

	/**
	 * Make a PUT request.
	 */
	async put(path: string, data?: Record<string, any>): Promise<AxiosResponse> {
		return this.request("PUT", path, undefined, data);
	}

	/**
	 * Make a DELETE request.
	 */
	async delete(path: string, params?: Record<string, any>): Promise<AxiosResponse> {
		return this.request("DELETE", path, params);
	}

	/**
	 * Stream Server-Sent Events (SSE) from the API.
	 */
	async *streamLines(path: string, params?: Record<string, any>): AsyncGenerator<string> {
		const url = `${this.baseUrl}${path}`;
		const filteredParams = this.filterParams(params);

		try {
			const response = await this.client.request({
				method: "GET",
				url,
				params: filteredParams,
				responseType: "stream",
				headers: {
					"Accept": "text/event-stream",
				},
			});

			if (response.status === 422) {
				throw new ValidationError("Validation error", response.status);
			}
			if (response.status === 500) {
				throw new InternalServerError("Internal server error", response.status);
			}
			if (response.status === 404) {
				// Read the stream body to check if it's a router-level 404
				const chunks: Buffer[] = [];
				for await (const chunk of response.data as AsyncIterable<Buffer>) {
					chunks.push(chunk);
					if (Buffer.concat(chunks).length > 100) break;
				}
				const bodyText = Buffer.concat(chunks).toString("utf8").trim();
				if (bodyText === "404 page not found") {
					throw new ConnectionError("Resource not found", response.status);
				}
				return; // API-level 404, empty generator
			}
			if (response.status === 401) {
				throw new AuthenticationError("Authentication failed", response.status);
			}
			if (response.status === 429) {
				throw new RateLimitError("Please try again in a few moments.", response.status);
			}

			let buffer = "";
			for await (const chunk of response.data as AsyncIterable<Buffer>) {
				buffer += chunk.toString("utf8");
				const lines = buffer.split("\n");
				buffer = lines.pop() || "";
				for (const line of lines) {
					if (line.length > 0) {
						yield line;
					}
				}
			}
		} catch (error) {
			if (axios.isAxiosError(error)) {
				const axiosError = error as AxiosError;

				if (axiosError.code === "ECONNABORTED" || axiosError.message.includes("timeout")) {
					throw new TimeoutError(`Request timed out: ${axiosError.message}`, 0);
				}

				if (axiosError.code === "ECONNREFUSED" || axiosError.code === "ENOTFOUND") {
					throw new ConnectionError(`Failed to connect to the API: ${axiosError.message}`, 0);
				}
			}
			throw error;
		}
	}

	/**
	 * Fetch the global system prompt, caching it for one hour.
	 */
	async getCachedSystemPrompt(): Promise<string> {
		const now = Date.now();
		if (this._systemPromptCache !== null && now < this._systemPromptCacheExpiresAt) {
			return this._systemPromptCache;
		}
		const response = await this.get("/api/v1/system-prompt");
		this._systemPromptCache = response.data.system_prompt as string;
		this._systemPromptCacheExpiresAt = now + 3600 * 1000;
		return this._systemPromptCache;
	}
}
