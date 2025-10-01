import { z } from 'zod';
import { MessageRole, SessionStatus } from './session';

/**
 * Schema for user model validation.
 */
export const userSchema = z.object({
    userId: z.string(),
    metadata: z.record(z.any()),
    createdAt: z.date(),
    lastActiveAt: z.date(),
});

/**
 * Schema for user list validation.
 */
export const userListSchema = z.object({
    users: z.array(userSchema),
    total: z.number(),
    hasMore: z.boolean(),
});

/**
 * Schema for message validation.
 */
export const messageSchema = z.object({
    role: z.nativeEnum(MessageRole),
    content: z.string(),
    timestamp: z.date(),
});

/**
 * Schema for session validation.
 */
export const sessionSchema = z.object({
    sessionId: z.string(),
    status: z.nativeEnum(SessionStatus),
    createdAt: z.date(),
    metadata: z.record(z.any()).default({}),
});

/**
 * Schema for session list validation.
 */
export const sessionListSchema = z.object({
    sessions: z.array(sessionSchema),
    total: z.number(),
    hasMore: z.boolean(),
});

/**
 * Schema for context validation.
 */
export const contextSchema = z.object({
    context: z.string(),
});

/**
 * Schema for session messages list validation.
 */
export const sessionMessagesListSchema = z.object({
    messages: z.array(messageSchema),
    total: z.number(),
    hasMore: z.boolean(),
});

/**
 * Schemas for user memories
 */
export const userMemoryItemSchema = z.object({
    memory_id: z.string(),
    categories: z.array(z.string()),
    content: z.string(),
    created_at: z.string(),
});

export const userMemoriesListSchema = z.object({
    items: z.array(userMemoryItemSchema),
    total: z.number(),
    has_more: z.boolean(),
});
