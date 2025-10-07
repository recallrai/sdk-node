/**
 * HTTP client for making requests to the RecallrAI API.
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import { TimeoutError, ConnectionError, ValidationError, InternalServerError, AuthenticationError } from "../errors";

/**
 * HTTP client for making requests to the RecallrAI API.
 */
export class HTTPClient {
	private client: AxiosInstance;
	private apiKey: string;
	private projectId: string;
	private baseUrl: string;
	private timeout: number;

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
			headers: {
				"X-Recallr-Api-Key": this.apiKey,
				"X-Recallr-Project-Id": this.projectId,
				"Content-Type": "application/json",
				Accept: "application/json",
				"User-Agent": "RecallrAI-Node-SDK/0.3.1",
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
			} else if (response.status === 401) {
				const detail = response.data?.detail || "Authentication failed";
				throw new AuthenticationError(detail, response.status);
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

				if (axiosError.response) {
					const status = axiosError.response.status;
					const detail = (axiosError.response.data as any)?.detail || axiosError.message;

					if (status === 422) {
						throw new ValidationError(detail, status);
					} else if (status === 500) {
						throw new InternalServerError(detail, status);
					} else if (status === 401) {
						throw new AuthenticationError(detail, status);
					}
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
	async delete(path: string): Promise<AxiosResponse> {
		return this.request("DELETE", path);
	}
}
