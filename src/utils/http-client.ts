import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
    TimeoutError,
    NetworkError,
    ConnectionError,
    ValidationError,
    InternalServerError,
    AuthenticationError,
} from '../errors';

export interface HTTPClientOptions {
    apiKey: string;
    projectId: string;
    baseUrl: string;
    timeout: number;
}

export class HTTPClient {
    private client: AxiosInstance;

    constructor(options: HTTPClientOptions) {
        const { apiKey, projectId, baseUrl, timeout } = options;

        this.client = axios.create({
            baseURL: baseUrl.replace(/\/$/, ''),
            timeout,
            headers: {
                'X-Api-Key': apiKey,
                'X-Project-Id': projectId,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'RecallrAI-Node-SDK',
            },
        });
    }

    /**
     * Make a GET request.
     * 
     * @param path API endpoint path
     * @param config Additional request configuration
     * @returns Response data
     */
    async get(path: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
        try {
            return await this.client.get(path, config);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Make a POST request.
     * 
     * @param path API endpoint path
     * @param data Request body data
     * @param config Additional request configuration
     * @returns Response data
     */
    async post(path: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
        try {
            return await this.client.post(path, data, config);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Make a PUT request.
     * 
     * @param path API endpoint path
     * @param data Request body data
     * @param config Additional request configuration
     * @returns Response data
     */
    async put(path: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
        try {
            return await this.client.put(path, data, config);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Make a DELETE request.
     * 
     * @param path API endpoint path
     * @param config Additional request configuration
     * @returns Response data
     */
    async delete(path: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
        try {
            return await this.client.delete(path, config);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Handle errors and convert to appropriate SDK errors.
     * 
     * @param error The original error
     * @returns A standardized error
     */
    private handleError(error: any): Error {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const data = error.response?.data || {};
            const detail = data.detail || 'An unknown error occurred';

            if (error.code === 'ECONNABORTED') {
                return new TimeoutError('Request timed out');
            }

            if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                return new ConnectionError(`Failed to connect to the API: ${error.message}`);
            }

            if (!error.response) {
                return new NetworkError(`Network error occurred: ${error.message}`);
            }

            if (status === 422) {
                return new ValidationError(detail);
            }

            if (status === 500) {
                return new InternalServerError(detail);
            }

            if (status === 401) {
                return new AuthenticationError(detail);
            }

            // Add error information to the error object
            const customError = new Error(detail) as any;
            customError.status = status;
            customError.data = data;
            return customError;
        }

        return error;
    }
}
