import dotenv from 'dotenv';
import { RecallrAI } from '../../src/client';

// Load environment variables
dotenv.config();

// Required environment variables for integration tests
const requiredEnvVars = [
    'RECALLRAI_TEST_API_KEY',
    'RECALLRAI_TEST_PROJECT_ID'
];

/**
 * Checks if all required environment variables are set
 */
export function hasRequiredEnvVars(): boolean {
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            return false;
        }
    }
    return true;
}

/**
 * Skip test if required environment variables are not set
 */
export function skipIfMissingEnvVars(): void {
    if (!hasRequiredEnvVars()) {
        const missing = requiredEnvVars.filter(name => !process.env[name]);
        console.warn(`⚠️ Skipping integration test: Missing environment variables: ${missing.join(', ')}`);
        return test.skip('Integration test skipped due to missing environment variables', () => {
            // This test is skipped
        });
    }
}

/**
 * Create a real client for integration tests
 */
export function createTestClient(): RecallrAI {
    if (!hasRequiredEnvVars()) {
        throw new Error('Cannot create test client: Missing required environment variables');
    }

    return new RecallrAI({
        apiKey: process.env.RECALLRAI_TEST_API_KEY as string,
        projectId: process.env.RECALLRAI_TEST_PROJECT_ID as string,
        baseUrl: process.env.RECALLRAI_TEST_BASE_URL || 'https://api.recallrai.com',
        timeout: parseInt(process.env.RECALLRAI_TEST_TIMEOUT || '30000')
    });
}

/**
 * Generate a unique user ID for testing
 */
export function generateTestUserId(): string {
    return `test_user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}
