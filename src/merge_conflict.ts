/**
 * Merge conflict management functionality for the RecallrAI SDK.
 */

import { HTTPClient } from './utils';
import {
    MergeConflictModel,
    MergeConflictStatus,
    MergeConflictAnswer,
} from './models';
import {
    UserNotFoundError,
    MergeConflictNotFoundError,
    MergeConflictAlreadyResolvedError,
    MergeConflictInvalidQuestionsError,
    MergeConflictMissingAnswersError,
    MergeConflictInvalidAnswerError,
    RecallrAIError
} from './errors';

/**
 * Represents a merge conflict in the RecallrAI system.
 * 
 * This class provides methods for inspecting and resolving merge conflicts
 * that occur when new memories conflict with existing ones.
 */
export class MergeConflict {
    private _http: HTTPClient;
    private _conflictData: MergeConflictModel;

    /**
     * User ID who owns this conflict.
     */
    public userId: string;

    /**
     * Unique identifier for the merge conflict.
     */
    public conflictId: string;

    /**
     * Current status of the conflict.
     */
    public status: MergeConflictStatus;

    /**
     * New memory content that caused the conflict.
     */
    public newMemoryContent: string;

    /**
     * Existing memories that conflict.
     */
    public conflictingMemories: MergeConflictModel['conflictingMemories'];

    /**
     * Questions to resolve the conflict.
     */
    public clarifyingQuestions: MergeConflictModel['clarifyingQuestions'];

    /**
     * When the conflict was created.
     */
    public createdAt: Date;

    /**
     * When the conflict was resolved.
     */
    public resolvedAt?: Date;

    /**
     * Resolution data if resolved.
     */
    public resolutionData?: Record<string, any>;

    /**
     * Initialize a merge conflict.
     *
     * @param httpClient - HTTP client for API communication.
     * @param userId - User ID who owns this conflict.
     * @param conflictData - Merge conflict data model.
     */
    constructor(
        httpClient: HTTPClient,
        userId: string,
        conflictData: MergeConflictModel,
    ) {
        this._http = httpClient;
        this.userId = userId;
        this._conflictData = conflictData;
        
        // Expose key properties for easy access
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
     * Resolve a merge conflict by providing answers to clarifying questions.
     *
     * @param answers - List of answers to the clarifying questions.
     * 
     * @throws {UserNotFoundError} If the user doesn't exist.
     * @throws {MergeConflictNotFoundError} If the merge conflict doesn't exist.
     * @throws {MergeConflictAlreadyResolvedError} If the conflict is already resolved.
     * @throws {MergeConflictInvalidQuestionsError} If the provided questions don't match.
     * @throws {MergeConflictMissingAnswersError} If not all questions are answered.
     * @throws {MergeConflictInvalidAnswerError} If an answer is not a valid option.
     * @throws {RecallrAIError} For other API-related errors.
     */
    async resolve(answers: MergeConflictAnswer[]): Promise<void> {
        try {
            const response = await this._http.post(
                `/api/v1/users/${this.userId}/merge_conflicts/${this.conflictId}/resolve`,
                { answers: answers.map(answer => ({
                    question: answer.question,
                    answer: answer.answer,
                    message: answer.message,
                })) }
            );

            if (response.status === 404) {
                if (response.data?.error?.includes('User')) {
                    throw new UserNotFoundError(response.data.error, response.status);
                } else {
                    throw new MergeConflictNotFoundError(response.data?.error || 'Merge conflict not found', response.status);
                }
            } else if (response.status === 409) {
                throw new MergeConflictAlreadyResolvedError(response.data?.error || 'Merge conflict already resolved', response.status);
            } else if (response.status === 422) {
                const errorMessage = response.data?.error || 'Validation error';
                if (errorMessage.includes('questions')) {
                    throw new MergeConflictInvalidQuestionsError(errorMessage, response.status);
                } else if (errorMessage.includes('missing') || errorMessage.includes('required')) {
                    throw new MergeConflictMissingAnswersError(errorMessage, response.status);
                } else if (errorMessage.includes('invalid') && errorMessage.includes('answer')) {
                    throw new MergeConflictInvalidAnswerError(errorMessage, response.status);
                } else {
                    throw new RecallrAIError(errorMessage, response.status);
                }
            } else if (response.status >= 400) {
                throw new RecallrAIError(response.data?.error || 'Failed to resolve merge conflict', response.status);
            }

            // Refresh conflict data after successful resolution
            await this.refresh();
        } catch (error: any) {
            if (error instanceof RecallrAIError) {
                throw error;
            }
            throw new RecallrAIError(`Failed to resolve merge conflict: ${error.message}`, 500);
        }
    }

    /**
     * Refresh the merge conflict data from the API.
     * 
     * @throws {UserNotFoundError} If the user doesn't exist.
     * @throws {MergeConflictNotFoundError} If the merge conflict doesn't exist.
     * @throws {RecallrAIError} For other API-related errors.
     */
    async refresh(): Promise<void> {
        try {
            const response = await this._http.get(
                `/api/v1/users/${this.userId}/merge_conflicts/${this.conflictId}`
            );

            if (response.status === 404) {
                if (response.data?.error?.includes('User')) {
                    throw new UserNotFoundError(response.data.error, response.status);
                } else {
                    throw new MergeConflictNotFoundError(response.data?.error || 'Merge conflict not found', response.status);
                }
            } else if (response.status >= 400) {
                throw new RecallrAIError(response.data?.error || 'Failed to refresh merge conflict', response.status);
            }

            // Update conflict data
            this._conflictData = MergeConflictModel.fromApiResponse(response.data);
            
            // Update exposed properties
            this.status = this._conflictData.status;
            this.newMemoryContent = this._conflictData.newMemoryContent;
            this.conflictingMemories = this._conflictData.conflictingMemories;
            this.clarifyingQuestions = this._conflictData.clarifyingQuestions;
            this.createdAt = this._conflictData.createdAt;
            this.resolvedAt = this._conflictData.resolvedAt;
            this.resolutionData = this._conflictData.resolutionData;
        } catch (error: any) {
            if (error instanceof RecallrAIError) {
                throw error;
            }
            throw new RecallrAIError(`Failed to refresh merge conflict: ${error.message}`, 500);
        }
    }

    /**
     * String representation of the merge conflict.
     */
    toString(): string {
        return `MergeConflict(id=${this.conflictId}, status=${this.status}, user_id=${this.userId})`;
    }
}