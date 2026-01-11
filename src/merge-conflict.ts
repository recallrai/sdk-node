/**
 * Merge conflict management functionality for the RecallrAI SDK.
 */

import { HTTPClient } from "./utils";
import { MergeConflictModel, MergeConflictStatus, MergeConflictAnswer, MergeConflictMemory, MergeConflictQuestion } from "./models";
import {
	UserNotFoundError,
	MergeConflictNotFoundError,
	MergeConflictAlreadyResolvedError,
	MergeConflictInvalidQuestionsError,
	MergeConflictMissingAnswersError,
	MergeConflictInvalidAnswerError,
	RecallrAIError,
} from "./errors";

/**
 * Represents a merge conflict in the RecallrAI system.
 *
 * This class provides methods for inspecting and resolving merge conflicts
 * that occur when new memories conflict with existing ones.
 */
export class MergeConflict {
	private http: HTTPClient;
	private conflictData: MergeConflictModel;

	public readonly userId: string;
	public conflictId: string;
	public status: MergeConflictStatus;
	public newMemoryContent: string;
	public conflictingMemories: MergeConflictMemory[];
	public clarifyingQuestions: MergeConflictQuestion[];
	public createdAt: Date;
	public resolvedAt?: Date;
	public resolutionData?: Record<string, any>;

	/**
	 * Initialize a merge conflict.
	 *
	 * @param httpClient - HTTP client for API communication.
	 * @param userId - User ID who owns this conflict.
	 * @param conflictData - Merge conflict data model.
	 */
	constructor(httpClient: HTTPClient, userId: string, conflictData: MergeConflictModel) {
		this.http = httpClient;
		this.userId = userId;
		this.conflictData = conflictData;

		this.conflictId = conflictData.id;
		this.status = conflictData.status;
		this.newMemoryContent = conflictData.newMemoryContent;
		this.conflictingMemories = conflictData.conflictingMemories;
		this.clarifyingQuestions = conflictData.clarifyingQuestions;
		this.createdAt = conflictData.createdAt;
		this.resolvedAt = conflictData.resolvedAt;
		this.resolutionData = conflictData.resolutionData;
	}

	/**
	 * Resolve this merge conflict by providing answers to clarifying questions.
	 *
	 * @param answers - List of answers to the clarifying questions.
	 * @throws {UserNotFoundError} If the user is not found.
	 * @throws {MergeConflictNotFoundError} If the merge conflict is not found.
	 * @throws {MergeConflictAlreadyResolvedError} If the conflict is already resolved.
	 * @throws {MergeConflictInvalidQuestionsError} If the provided questions don't match the original questions.
	 * @throws {MergeConflictMissingAnswersError} If not all required questions have been answered.
	 * @throws {MergeConflictInvalidAnswerError} If an answer is not a valid option for its question.
	 * @throws {ValidationError} If the answers are invalid.
	 * @throws {AuthenticationError} If the API key or project ID is invalid.
	 * @throws {InternalServerError} If the server encounters an error.
	 * @throws {NetworkError} If there are network issues.
	 * @throws {TimeoutError} If the request times out.
	 * @throws {RecallrAIError} For other API-related errors.
	 */
	async resolve(answers: MergeConflictAnswer[]): Promise<void> {
		if (this.status === MergeConflictStatus.RESOLVED || this.status === MergeConflictStatus.FAILED) {
			throw new MergeConflictAlreadyResolvedError(`Merge conflict ${this.conflictId} is already resolved`, 400);
		}

		const answerData = {
			answers: {
				question_answers: answers.map((answer) => ({
					question: answer.question,
					answer: answer.answer,
					message: answer.message,
				})),
			},
		};

		const response = await this.http.post(`/api/v1/users/${this.userId}/merge-conflicts/${this.conflictId}/resolve`, answerData);

		if (response.status === 404) {
			const detail = response.data?.detail || "";
			if (detail.includes(`User ${this.userId} not found`)) {
				throw new UserNotFoundError(detail, response.status);
			} else {
				throw new MergeConflictNotFoundError(detail, response.status);
			}
		} else if (response.status === 400) {
			const detail = response.data?.detail || "";
			if (detail.includes("already resolved")) {
				throw new MergeConflictAlreadyResolvedError(detail, response.status);
			} else if (detail.includes("Invalid questions provided")) {
				throw new MergeConflictInvalidQuestionsError(detail, response.status);
			} else if (detail.includes("Missing answers for the following questions")) {
				throw new MergeConflictMissingAnswersError(detail, response.status);
			} else if (detail.includes("Invalid answer") && detail.includes("for question")) {
				throw new MergeConflictInvalidAnswerError(detail, response.status);
			} else {
				throw new RecallrAIError(detail, response.status);
			}
		} else if (response.status !== 200) {
			throw new RecallrAIError(response.data?.detail || "Unknown error", response.status);
		}

		const updatedData = this.parseMergeConflictResponse(response.data);
		this.conflictData = updatedData;
		this.status = updatedData.status;
		this.resolvedAt = updatedData.resolvedAt;
		this.resolutionData = updatedData.resolutionData;
	}

	/**
	 * Refresh this merge conflict's data from the API.
	 *
	 * @throws {UserNotFoundError} If the user is not found.
	 * @throws {MergeConflictNotFoundError} If the merge conflict is not found.
	 * @throws {AuthenticationError} If the API key or project ID is invalid.
	 * @throws {InternalServerError} If the server encounters an error.
	 * @throws {NetworkError} If there are network issues.
	 * @throws {TimeoutError} If the request times out.
	 * @throws {RecallrAIError} For other API-related errors.
	 */
	async refresh(): Promise<void> {
		const response = await this.http.get(`/api/v1/users/${this.userId}/merge-conflicts/${this.conflictId}`);

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

		const updatedData = this.parseMergeConflictResponse(response.data);
		this.conflictData = updatedData;
		this.status = updatedData.status;
		this.resolvedAt = updatedData.resolvedAt;
		this.resolutionData = updatedData.resolutionData;
	}

	private parseMergeConflictResponse(data: any): MergeConflictModel {
		const conflictData = data.conflict || data;

		return {
			id: conflictData.id,
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
		return `MergeConflict(id='${this.conflictId}', status='${this.status}', user_id='${this.userId}')`;
	}
}
