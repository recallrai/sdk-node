import { createTestClient, skipIfMissingEnvVars, generateTestUserId } from '../utils/testHelper';
import { UserNotFoundError, UserAlreadyExistsError } from '../../src/errors';

// Skip all tests if environment variables are not configured
beforeAll(() => {
    skipIfMissingEnvVars();
});

describe('User Integration Tests', () => {
    const client = createTestClient();
    let testUserId: string;

    beforeEach(() => {
        // Create a unique user ID for each test
        testUserId = generateTestUserId();
    });

    test('should create and retrieve a user', async () => {
        // Create a test user with metadata
        const metadata = { name: 'Integration Test User', email: 'test@example.com' };
        const createdUser = await client.createUser(testUserId, metadata);

        // Verify user properties
        expect(createdUser.userId).toBe(testUserId);
        expect(createdUser.metadata).toEqual(metadata);
        expect(createdUser.createdAt).toBeInstanceOf(Date);
        expect(createdUser.lastActiveAt).toBeInstanceOf(Date);

        // Verify we can retrieve the same user
        const retrievedUser = await client.getUser(testUserId);
        expect(retrievedUser.userId).toBe(testUserId);
        expect(retrievedUser.metadata).toEqual(metadata);

        // Clean up - delete the user
        await retrievedUser.delete();
    });

    test('should throw UserNotFoundError when user does not exist', async () => {
        await expect(client.getUser('nonexistent_user_' + Date.now())).rejects.toThrow(UserNotFoundError);
    });

    test('should throw UserAlreadyExistsError when creating duplicate user', async () => {
        // Create the user first
        await client.createUser(testUserId);

        // Try to create again - should fail
        await expect(client.createUser(testUserId)).rejects.toThrow(UserAlreadyExistsError);

        // Clean up
        const user = await client.getUser(testUserId);
        await user.delete();
    });

    test('should update user metadata', async () => {
        // Create a user
        const user = await client.createUser(testUserId, { initial: 'value' });

        // Update the metadata
        const newMetadata = { updated: 'metadata', version: 2 };
        const updatedUser = await user.update(newMetadata);

        expect(updatedUser.metadata).toEqual(newMetadata);

        // Verify by retrieving again
        const retrievedUser = await client.getUser(testUserId);
        expect(retrievedUser.metadata).toEqual(newMetadata);

        // Clean up
        await retrievedUser.delete();
    });

    test('should update a user id', async () => {
        // Create a user
        const user = await client.createUser(testUserId, { initial: 'value' });
        const newUserId = generateTestUserId();
        // Update the user ID
        const updatedUser = await user.update(undefined, newUserId);
        
        // Verify the user ID was updated
        expect(updatedUser.userId).toBe(newUserId);
        
        // Clean up
        await updatedUser.delete();
    });

    test('should list users including our test user', async () => {
        // Create a test user
        await client.createUser(testUserId, { tag: 'for-listing-test' });

        // List all users
        const userList = await client.listUsers(0, 50);

        // Check if our test user is included
        const foundUser = userList.users.find(u => u.userId === testUserId);
        expect(foundUser).toBeDefined();
        expect(foundUser?.metadata).toEqual({ tag: 'for-listing-test' });

        // Clean up
        const user = await client.getUser(testUserId);
        await user.delete();
    });
});
