import { createTestClient, skipIfMissingEnvVars, generateTestUserId } from '../utils/testHelper';
import { SessionStatus } from '../../src/models/session';
import { User, Session } from '../../src/index';
import { UserNotFoundError, SessionNotFoundError } from '../../src/errors';

// Skip all tests if environment variables are not configured
beforeAll(() => {
    skipIfMissingEnvVars();
});

describe('Session Integration Tests', () => {
    const client = createTestClient();
    let testUserId: string;
    let user: User;

    // Set up: Create a test user before each test
    beforeEach(async () => {
        testUserId = generateTestUserId();
        user = await client.createUser(testUserId, { source: 'session-integration-test' });
    });

    // Clean up: Delete the test user after each test
    afterEach(async () => {
        try {
            await user.delete();
        } catch (error) {
            // If user doesn't exist anymore, ignore the error
            if (!(error instanceof UserNotFoundError)) {
                throw error;
            }
        }
    });

    test('should create a session and verify its existence', async () => {
        // Create a new session
        const session = await user.createSession(30);
        expect(session.sessionId).toBeDefined();
        expect(session.userId).toBe(testUserId);

        // Verify we can get the session's status
        const status = await session.getStatus();
        expect(status).toBe(SessionStatus.PENDING);

        // Verify we can get the session through the user
        const retrievedSession = await user.getSession(session.sessionId);
        expect(retrievedSession.sessionId).toBe(session.sessionId);
    });

    test('should add messages to a session and retrieve them', async () => {
        // Create a new session
        const session = await user.createSession();

        // Add messages
        await session.addUserMessage('Hello from the user');
        await session.addAssistantMessage('Hello from the assistant');

        // Get messages
        const messages = await session.getMessages();
        expect(messages.length).toBe(2);
        expect(messages[0].role).toBe('user');
        expect(messages[0].content).toBe('Hello from the user');
        expect(messages[1].role).toBe('assistant');
        expect(messages[1].content).toBe('Hello from the assistant');
    });

    test('should get context from a session after adding messages', async () => {
        // Create a new session
        const session = await user.createSession();

        // Add messages
        await session.addUserMessage('I like artificial intelligence and machine learning');

        // Get context - might not have memory used if this is a new user
        const context = await session.getContext();
        expect(context).toBeDefined();

        // Context structure should be correct even if memoryUsed is false for new users
        expect(typeof context.context).toBe('string');
        expect(typeof context.memoryUsed).toBe('boolean');
    });

    test('should process a session', async () => {
        // Create a new session
        const session = await user.createSession();

        // Add messages
        await session.addUserMessage('This is an important fact: I live in New York City');
        await session.addAssistantMessage('That\'s great! New York is an amazing city.');

        // Process the session
        await session.process();

        // Verify the status is now processed
        const status = await session.getStatus();
        expect(status).toBe(SessionStatus.PROCESSED);
    });

    test('should list sessions for a user', async () => {
        // Create multiple sessions
        const session1 = await user.createSession();
        const session2 = await user.createSession();

        // List sessions
        const sessionList = await user.listSessions(0, 10);

        // Should have at least 2 sessions
        expect(sessionList.sessions.length).toBeGreaterThanOrEqual(2);

        // Our sessions should be in the list
        const sessionIds = sessionList.sessions.map(s => s.sessionId);
        expect(sessionIds).toContain(session1.sessionId);
        expect(sessionIds).toContain(session2.sessionId);
    });

    test('should throw SessionNotFoundError for nonexistent session', async () => {
        // Try to get a session with a random ID
        const fakeSessionId = `fake_session_${Date.now()}`;
        await expect(user.getSession(fakeSessionId)).rejects.toThrow(SessionNotFoundError);
    });
});
