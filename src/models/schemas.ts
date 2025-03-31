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
    memoryUsed: z.boolean(),
    context: z.string(),
});
