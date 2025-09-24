# RecallrAI Node.js SDK

Official Node.js SDK for RecallrAI – a revolutionary contextual memory system that enables AI assistants to form meaningful connections between conversations, just like human memory.

**Note:** All datetime objects returned by the SDK are in UTC timezone.

## Installation

Install the SDK using npm or yarn:

```bash
npm install recallrai
# or
yarn add recallrai
```

## Initialization

Create a client instance with your API key and project ID:

```typescript
import { RecallrAI } from 'recallrai';

const client = new RecallrAI({
    apiKey: "rai_yourapikey",
    projectId: "project-uuid",
    baseUrl: "https://api.recallrai.com",  // custom endpoint if applicable
    timeout: 60000,  // milliseconds
});
```

## User Management

### Create a User

```typescript
import { UserAlreadyExistsError } from 'recallrai';

try {
    const user = await client.createUser("user123", { name: "John Doe" });
    console.log(`Created user: ${user.userId}`);
    console.log(`User metadata: ${JSON.stringify(user.metadata)}`);
    console.log(`Created at: ${user.createdAt}`);
} catch (error) {
    if (error instanceof UserAlreadyExistsError) {
        console.log(`Error: ${error.message}`);
    }
}
```

### Get a User

```typescript
import { UserNotFoundError } from 'recallrai';

try {
    const user = await client.getUser("user123");
    console.log(`User metadata: ${JSON.stringify(user.metadata)}`);
    console.log(`Last active: ${user.lastActiveAt}`);
} catch (error) {
    if (error instanceof UserNotFoundError) {
        console.log(`Error: ${error.message}`);
    }
}
```

### List Users

```typescript
const userList = await client.listUsers(0, 10, { role: "admin" });
console.log(`Total users: ${userList.total}`);
console.log(`Has more users: ${userList.hasMore}`);

for (const user of userList.users) {
    console.log(`User ID: ${user.userId}`);
    console.log(`Metadata: ${JSON.stringify(user.metadata)}`);
    console.log(`Created at: ${user.createdAt}`);
    console.log(`Last active: ${user.lastActiveAt}`);
    console.log("---");
}
```

### Update a User

```typescript
import { UserNotFoundError, UserAlreadyExistsError } from 'recallrai';

try {
    const user = await client.getUser("user123");
    // update() mutates the instance; no value is returned
    await user.update(
        { name: "John Doe", role: "admin" },  // new metadata
        "john_doe"  // new user ID
    );
    console.log(`Updated user ID: ${user.userId}`);
    console.log(`Updated metadata: ${JSON.stringify(user.metadata)}`);
    console.log(`Last active: ${user.lastActiveAt}`);
} catch (error) {
    if (error instanceof UserNotFoundError) {
        console.log(`Error: ${error.message}`);
    } else if (error instanceof UserAlreadyExistsError) {
        console.log(`Error: ${error.message}`);
    }
}
```

### Refresh User Instance

```typescript
import { UserNotFoundError } from 'recallrai';

try {
    const user = await client.getUser("john_doe");
    await user.refresh();
    console.log(`Refreshed user metadata: ${JSON.stringify(user.metadata)}`);
    console.log(`Last active: ${user.lastActiveAt}`);
} catch (error) {
    if (error instanceof UserNotFoundError) {
        console.log(`Error: ${error.message}`);
    }
}
```

### Delete a User

```typescript
import { UserNotFoundError } from 'recallrai';

try {
    const user = await client.getUser("john_doe");
    await user.delete();
    console.log("User deleted successfully");
} catch (error) {
    if (error instanceof UserNotFoundError) {
        console.log(`Error: ${error.message}`);
    }
}
```

## Session Management

### Create a Session

```typescript
import { UserNotFoundError } from 'recallrai';
import { Session } from 'recallrai';

try {
    // First, get the user
    const user = await client.getUser("user123");
    
    // Create a session for the user.
    const session: Session = await user.createSession(
        600,  // auto_process_after_seconds
        { type: "chat" }  // metadata
    );
    console.log("Created session id:", session.sessionId);
} catch (error) {
    if (error instanceof UserNotFoundError) {
        console.log(`Error: ${error.message}`);
    }
}
```

### Get an Existing Session

```typescript
import { UserNotFoundError, SessionNotFoundError } from 'recallrai';

try {
    // First, get the user
    const user = await client.getUser("user123");
    
    // Retrieve an existing session by its ID
    const session = await user.getSession("session-uuid");
    console.log("Session status:", session.status);
    console.log("Session metadata:", session.metadata);
} catch (error) {
    if (error instanceof UserNotFoundError) {
        console.log(`Error: ${error.message}`);
    } else if (error instanceof SessionNotFoundError) {
        console.log(`Error: ${error.message}`);
    }
}
```

### Update a Session

```typescript
import { UserNotFoundError, SessionNotFoundError } from 'recallrai';

try {
    // First, get the user
    const user = await client.getUser("user123");
    
    // Retrieve an existing session by its ID
    const session = await user.getSession("session-uuid");
    
    // Update session metadata
    await session.update({ type: "support_chat" });
    console.log("Updated session metadata:", session.metadata);
} catch (error) {
    if (error instanceof UserNotFoundError) {
        console.log(`Error: ${error.message}`);
    } else if (error instanceof SessionNotFoundError) {
        console.log(`Error: ${error.message}`);
    }
}
```

### Refresh a Session

```typescript
import { UserNotFoundError, SessionNotFoundError } from 'recallrai';

try {
    // First, get the user
    const user = await client.getUser("user123");

    // Retrieve an existing session by its ID
    const session = await user.getSession("session-uuid");

    // Refresh session data from the server
    await session.refresh();
    console.log("Session status:", session.status);
    console.log("Refreshed session metadata:", session.metadata);
} catch (error) {
    if (error instanceof UserNotFoundError) {
        console.log(`Error: ${error.message}`);
    } else if (error instanceof SessionNotFoundError) {
        console.log(`Error: ${error.message}`);
    }
}
```

### List Sessions

```typescript
import { UserNotFoundError } from 'recallrai';

try {
    // First, get the user
    const user = await client.getUser("user123");
    
    // List sessions for this user with optional metadata filters
    const sessionList = await user.listSessions(
        0,  // offset
        10,  // limit
        { type: "chat" },  // metadata_filter (optional)
        { role: "admin" }   // user_metadata_filter (optional)
    );
    console.log(`Total sessions: ${sessionList.total}`);
    console.log(`Has more sessions: ${sessionList.hasMore}`);
    for (const session of sessionList.sessions) {
        console.log(session.sessionId, session.status, session.metadata);
    }
} catch (error) {
    if (error instanceof UserNotFoundError) {
        console.log(`Error: ${error.message}`);
    }
}
```

### Session – Adding Messages

```typescript
import { UserNotFoundError, SessionNotFoundError, InvalidSessionStateError } from 'recallrai';
import { MessageRole } from 'recallrai';

try {
    // Add a user message
    await session.addMessage(MessageRole.USER, "Hello! How are you?");
    
    // Add an assistant message
    await session.addMessage(MessageRole.ASSISTANT, "I'm an assistant. How can I help you?");
    
    // Available message roles:
    // - MessageRole.USER: Messages from the user/human
    // - MessageRole.ASSISTANT: Messages from the AI assistant
} catch (error) {
    if (error instanceof UserNotFoundError) {
        console.log(`Error: ${error.message}`);
    } else if (error instanceof SessionNotFoundError) {
        console.log(`Error: ${error.message}`);
    } else if (error instanceof InvalidSessionStateError) {
        console.log(`Error: ${error.message}`);
    }
}
```

### Session – Retrieving Context

```typescript
import { UserNotFoundError, SessionNotFoundError } from 'recallrai';
import { RecallStrategy } from 'recallrai';

try {
    // Get context with default parameters
    const context = await session.getContext();
    console.log("Context:", context.context);
    
    // Get context with specific recall strategy
    const contextWithStrategy = await session.getContext(RecallStrategy.LOW_LATENCY);
    console.log("Context:", contextWithStrategy.context);
    
    // Get context with custom memory retrieval parameters
    const contextWithParams = await session.getContext(
        RecallStrategy.BALANCED,
        10,    // min_top_k
        100,   // max_top_k
        0.6,   // memories_threshold
        0.5,   // summaries_threshold
        20,    // last_n_messages
        5,     // last_n_summaries
        "America/Los_Angeles"  // timezone (optional: timezone for timestamp formatting, null for UTC)
    );
    console.log("Context:", contextWithParams.context);
    
    // Available recall strategies:
    // - RecallStrategy.LOW_LATENCY: Fast retrieval with basic relevance
    // - RecallStrategy.BALANCED: Good balance of speed and quality (default)
    // - RecallStrategy.DEEP: More thorough but slower memory search
    
    // Parameters:
    // - min_top_k: Minimum number of memories to return (default: 15, range: 5-50)
    // - max_top_k: Maximum number of memories to return (default: 50, range: 10-100)
    // - memories_threshold: Similarity threshold for memories (default: 0.6, range: 0.2-0.8)
    // - summaries_threshold: Similarity threshold for summaries (default: 0.5, range: 0.2-0.8)
    // - last_n_messages: Number of last messages to include in context (optional, range: 1-100)
    // - last_n_summaries: Number of last summaries to include in context (optional, range: 1-20)
    // - timezone: Timezone for formatting timestamps (optional, e.g., 'America/New_York', null for UTC)
} catch (error) {
    if (error instanceof UserNotFoundError) {
        console.log(`Error: ${error.message}`);
    } else if (error instanceof SessionNotFoundError) {
        console.log(`Error: ${error.message}`);
    }
}
```

### Session – Process Session

```typescript
import { UserNotFoundError, SessionNotFoundError, InvalidSessionStateError } from 'recallrai';

try {
    await session.process();
} catch (error) {
    if (error instanceof UserNotFoundError) {
        console.log(`Error: ${error.message}`);
    } else if (error instanceof SessionNotFoundError) {
        console.log(`Error: ${error.message}`);
    } else if (error instanceof InvalidSessionStateError) {
        console.log(`Error: ${error.message}`);
    }
}
```

### Session – List Messages

```typescript
import { UserNotFoundError, SessionNotFoundError } from 'recallrai';

try {
    // Paginated retrieval
    const messages = await session.getMessages(0, 50);
    for (const msg of messages.messages) {
        console.log(`${msg.role.toUpperCase()} (at ${msg.timestamp}): ${msg.content}`);
    }
    console.log(`Has more?: ${messages.hasMore}`);
    console.log(`Total messages: ${messages.total}`);
} catch (error) {
    if (error instanceof UserNotFoundError) {
        console.log(`Error: ${error.message}`);
    } else if (error instanceof SessionNotFoundError) {
        console.log(`Error: ${error.message}`);
    }
}
```

## User Memories

### List User Memories (with optional category filters)

```typescript
import { UserNotFoundError, InvalidCategoriesError } from 'recallrai';

try {
    const user = await client.getUser("user123");
    const memories = await user.listMemories(
        0,  // offset
        20,  // limit
        ["food_preferences", "allergies"]  // categories (optional)
    );
    for (const mem of memories.items) {
        console.log(`Memory ID: ${mem.memory_id}`);
        console.log(`Categories: ${mem.categories}`);
        console.log(`Content: ${mem.content}`);
        console.log(`Created at: ${mem.created_at}`);
        console.log("---");
    }
    console.log(`Has more?: ${memories.hasMore}`);
    console.log(`Total memories: ${memories.total}`);
} catch (error) {
    if (error instanceof UserNotFoundError) {
        console.log(`Error: ${error.message}`);
    } else if (error instanceof InvalidCategoriesError) {
        console.log(`Error: ${error.message}`);
    }
}
```

## User Messages

### Get Last N Messages

Retrieve the most recent messages for a user across all their sessions. This is particularly useful for chatbot applications where you need conversation context, such as WhatsApp support bots where you want to pass the last few messages to understand the ongoing conversation.

```typescript
import { UserNotFoundError } from 'recallrai';

try {
    const user = await client.getUser("user123");
    
    // Fetch last N messages (e.g., last 5)
    const messages = await user.getLastNMessages(5);
    
    for (const msg of messages.messages) {
        console.log(`Session ID: ${msg.sessionId}`);
        console.log(`${msg.role.toUpperCase()} (at ${msg.timestamp}): ${msg.content}`);
        console.log("---");
    }
} catch (error) {
    if (error instanceof UserNotFoundError) {
        console.log(`Error: ${error.message}`);
    }
}
```

## Merge Conflict Management

When RecallrAI processes sessions, it may detect conflicts between new memories and existing ones. The SDK provides comprehensive tools to handle these merge conflicts, allowing you to guide the resolution process through clarifying questions.

### List Merge Conflicts

```typescript
import { UserNotFoundError } from 'recallrai';
import { MergeConflictStatus } from 'recallrai';

try {
    const user = await client.getUser("user123");
    
    // List all merge conflicts (with optional status filter)
    const conflicts = await user.listMergeConflicts(
        0,  // offset
        10,  // limit
        MergeConflictStatus.PENDING,  // status (optional: filter by status)
        "created_at",  // sort_by (created_at, resolved_at)
        "desc"  // sort_order (asc, desc)
    );
    
    console.log(`Total conflicts: ${conflicts.total}`);
    console.log(`Has more: ${conflicts.hasMore}`);
    
    for (const conflict of conflicts.conflicts) {
        console.log(`Conflict ID: ${conflict.id}`);
        console.log(`Status: ${conflict.status}`);
        console.log(`New memory: ${conflict.newMemoryContent}`);
        console.log(`Conflicting memories: ${conflict.conflictingMemories.length}`);
        console.log(`Questions: ${conflict.clarifyingQuestions.length}`);
        console.log(`Created at: ${conflict.createdAt}`);
        console.log("---");
    }
} catch (error) {
    if (error instanceof UserNotFoundError) {
        console.log(`Error: ${error.message}`);
    }
}
```

### Get a Specific Merge Conflict

```typescript
import { UserNotFoundError, MergeConflictNotFoundError } from 'recallrai';

try {
    const user = await client.getUser("user123");
    const conflict = await user.getMergeConflict("conflict-uuid");
    
    console.log(`Conflict ID: ${conflict.conflictId}`);
    console.log(`Status: ${conflict.status}`);
    console.log(`New memory content: ${conflict.newMemoryContent}`);
    
    // Examine conflicting memories
    console.log("\nConflicting memories:");
    for (const memory of conflict.conflictingMemories) {
        console.log(`  Content: ${memory.content}`);
        console.log(`  Reason: ${memory.reason}`);
        console.log();
    }
    
    // View clarifying questions
    console.log("Clarifying questions:");
    for (const question of conflict.clarifyingQuestions) {
        console.log(`  Question: ${question.question}`);
        console.log(`  Options: ${question.options}`);
        console.log();
    }
} catch (error) {
    if (error instanceof UserNotFoundError) {
        console.log(`Error: ${error.message}`);
    } else if (error instanceof MergeConflictNotFoundError) {
        console.log(`Error: ${error.message}`);
    }
}
```

### Resolve a Merge Conflict

```typescript
import {
    UserNotFoundError, 
    MergeConflictNotFoundError,
    MergeConflictAlreadyResolvedError,
    MergeConflictInvalidQuestionsError,
    MergeConflictMissingAnswersError,
    MergeConflictInvalidAnswerError,
    ValidationError
} from 'recallrai';
import { MergeConflictAnswer } from 'recallrai';

try {
    const user = await client.getUser("user123");
    const conflict = await user.getMergeConflict("conflict-uuid");
    
    // Prepare answers to the clarifying questions
    const answers: MergeConflictAnswer[] = [];
    for (const question of conflict.clarifyingQuestions) {
        console.log(`  Question: ${question.question}`);
        console.log(`  Options: ${question.options}`);
        console.log();

        const answer = new MergeConflictAnswer({
            question: question.question,
            answer: question.options[0],  // Select first option
            message: "User prefers this option based on recent conversation"
        });
        answers.push(answer);
    }
    
    // Resolve the conflict
    await conflict.resolve(answers);
    console.log(`Conflict resolved! Status: ${conflict.status}`);
    console.log(`Resolved at: ${conflict.resolvedAt}`);
    
    if (conflict.resolutionData) {
        console.log(`Resolution data: ${JSON.stringify(conflict.resolutionData)}`);
    }
} catch (error) {
    if (error instanceof UserNotFoundError) {
        console.log(`Error: ${error.message}`);
    } else if (error instanceof MergeConflictNotFoundError) {
        console.log(`Error: ${error.message}`);
    } else if (error instanceof MergeConflictAlreadyResolvedError) {
        console.log(`Error: ${error.message}`);
    } else if (error instanceof MergeConflictInvalidQuestionsError) {
        console.log(`Error: ${error.message}`);
    } else if (error instanceof MergeConflictMissingAnswersError) {
        console.log(`Error: ${error.message}`);
    } else if (error instanceof MergeConflictInvalidAnswerError) {
        console.log(`Error: ${error.message}`);
    } else if (error instanceof ValidationError) {
        console.log(`Error: ${error.message}`);
    }
}
```

### Refresh Merge Conflict Data

```typescript
import { UserNotFoundError, MergeConflictNotFoundError } from 'recallrai';

try {
    const user = await client.getUser("user123");
    const conflict = await user.getMergeConflict("conflict-uuid");
    
    // Refresh to get latest status from server
    await conflict.refresh();
    console.log(`Current status: ${conflict.status}`);
    console.log(`Last updated: ${conflict.resolvedAt}`);
} catch (error) {
    if (error instanceof UserNotFoundError) {
        console.log(`Error: ${error.message}`);
    } else if (error instanceof MergeConflictNotFoundError) {
        console.log(`Error: ${error.message}`);
    }
}
```

### Working with Merge Conflict Statuses

The merge conflict system uses several status values to track the lifecycle of conflicts:

- **PENDING**: Conflict detected and waiting for resolution
- **IN_QUEUE**: Conflict is queued for automated processing  
- **RESOLVING**: Conflict is being processed
- **RESOLVED**: Conflict has been successfully resolved
- **FAILED**: Conflict resolution failed

```typescript
import { MergeConflictStatus } from 'recallrai';

// Filter conflicts by status
const pendingConflicts = await user.listMergeConflicts(0, 10, MergeConflictStatus.PENDING);
const resolvedConflicts = await user.listMergeConflicts(0, 10, MergeConflictStatus.RESOLVED);
```

## Error Handling

The SDK provides comprehensive error handling with specific exception classes for different types of failures:

### Authentication Errors

```typescript
import { AuthenticationError, InvalidApiKeyError } from 'recallrai';

try {
    // SDK operation
    const user = await client.getUser("user123");
} catch (error) {
    if (error instanceof AuthenticationError) {
        console.log(`Authentication failed: ${error.message}`);
    } else if (error instanceof InvalidApiKeyError) {
        console.log(`Invalid API key: ${error.message}`);
    }
}
```

### Network and Connection Errors

```typescript
import { NetworkError, TimeoutError, ConnectionError } from 'recallrai';

try {
    // SDK operation
    const user = await client.getUser("user123");
} catch (error) {
    if (error instanceof NetworkError) {
        console.log(`Network issue: ${error.message}`);
    } else if (error instanceof TimeoutError) {
        console.log(`Request timed out: ${error.message}`);
    } else if (error instanceof ConnectionError) {
        console.log(`Connection failed: ${error.message}`);
    }
}
```

### Server and Service Errors

```typescript
import { ServerError, InternalServerError, ServiceUnavailableError } from 'recallrai';

try {
    // SDK operation
    const user = await client.getUser("user123");
} catch (error) {
    if (error instanceof ServerError) {
        console.log(`Server error: ${error.message}`);
    } else if (error instanceof InternalServerError) {
        console.log(`Internal server error: ${error.message}`);
    } else if (error instanceof ServiceUnavailableError) {
        console.log(`Service unavailable: ${error.message}`);
    }
}
```

### User Management Errors

```typescript
import { 
    UserError, 
    UserNotFoundError, 
    UserAlreadyExistsError,
    InvalidUserIdError,
    UserLimitExceededError 
} from 'recallrai';

try {
    // SDK operation
    const user = await client.createUser("user123", { name: "John Doe" });
} catch (error) {
    if (error instanceof UserError) {
        console.log(`User-related error: ${error.message}`);
    } else if (error instanceof UserNotFoundError) {
        console.log(`User not found: ${error.message}`);
    } else if (error instanceof UserAlreadyExistsError) {
        console.log(`User already exists: ${error.message}`);
    } else if (error instanceof InvalidUserIdError) {
        console.log(`Invalid user ID: ${error.message}`);
    } else if (error instanceof UserLimitExceededError) {
        console.log(`User limit exceeded: ${error.message}`);
    }
}
```

### Session Management Errors

```typescript
import {
    SessionError,
    SessionNotFoundError,
    InvalidSessionStateError,
    SessionLimitExceededError,
    SessionAlreadyProcessedError,
    SessionProcessingError,
    InvalidSessionIdError
} from 'recallrai';

try {
    // SDK operation
    const session = await user.createSession(600);
} catch (error) {
    if (error instanceof SessionError) {
        console.log(`Session-related error: ${error.message}`);
    } else if (error instanceof SessionNotFoundError) {
        console.log(`Session not found: ${error.message}`);
    } else if (error instanceof InvalidSessionStateError) {
        console.log(`Invalid session state: ${error.message}`);
    } else if (error instanceof SessionLimitExceededError) {
        console.log(`Session limit exceeded: ${error.message}`);
    } else if (error instanceof SessionAlreadyProcessedError) {
        console.log(`Session already processed: ${error.message}`);
    } else if (error instanceof SessionProcessingError) {
        console.log(`Session processing failed: ${error.message}`);
    } else if (error instanceof InvalidSessionIdError) {
        console.log(`Invalid session ID: ${error.message}`);
    }
}
```

### Merge Conflict Errors

```typescript
import {
    MergeConflictError,
    MergeConflictNotFoundError,
    MergeConflictAlreadyResolvedError,
    MergeConflictInvalidQuestionsError,
    MergeConflictMissingAnswersError,
    MergeConflictInvalidAnswerError,
    MergeConflictResolutionError
} from 'recallrai';

try {
    // Resolve merge conflict
    await conflict.resolve(answers);
} catch (error) {
    if (error instanceof MergeConflictError) {
        console.log(`Merge conflict error: ${error.message}`);
    } else if (error instanceof MergeConflictNotFoundError) {
        console.log(`Merge conflict not found: ${error.message}`);
    } else if (error instanceof MergeConflictAlreadyResolvedError) {
        console.log(`Merge conflict already resolved: ${error.message}`);
    } else if (error instanceof MergeConflictInvalidQuestionsError) {
        console.log(`Invalid questions: ${error.message}`);
    } else if (error instanceof MergeConflictMissingAnswersError) {
        console.log(`Missing answers: ${error.message}`);
    } else if (error instanceof MergeConflictInvalidAnswerError) {
        console.log(`Invalid answer: ${error.message}`);
    } else if (error instanceof MergeConflictResolutionError) {
        console.log(`Resolution failed: ${error.message}`);
    }
}
```

### Validation Errors

```typescript
import { ValidationError, InvalidCategoriesError } from 'recallrai';

try {
    // SDK operation
    const memories = await user.listMemories(0, 20, ["invalid-category-format!"]);
} catch (error) {
    if (error instanceof ValidationError) {
        console.log(`Validation error: ${error.message}`);
    } else if (error instanceof InvalidCategoriesError) {
        console.log(`Invalid categories: ${error.message}`);
    }
}
```

### Base Exception Class

All exceptions inherit from the base `RecallrAIError` class:

```typescript
import { RecallrAIError } from 'recallrai';

try {
    // Any SDK operation
    const user = await client.getUser("user123");
} catch (error) {
    if (error instanceof RecallrAIError) {
        console.log(`RecallrAI error: ${error.message}`);
        console.log(`HTTP status: ${error.httpStatus}`);
    } else {
        console.log(`Unexpected error: ${error}`);
    }
}
```

## Advanced Usage

### Custom Configuration

```typescript
import { RecallrAI } from 'recallrai';

const client = new RecallrAI({
    apiKey: "rai_yourapikey",
    projectId: "project-uuid",
    baseUrl: "https://api.recallrai.com",  // Custom API endpoint
    timeout: 30000,  // 30 second timeout (default: 60000)
});
```

### Bulk Operations

```typescript
// Process multiple sessions in parallel
const user = await client.getUser("user123");
const sessionList = await user.listSessions(0, 100);

const processingPromises = sessionList.sessions
    .filter(session => session.status === 'CREATED')
    .map(session => session.process());

const results = await Promise.allSettled(processingPromises);
results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
        console.log(`Session ${index} processed successfully`);
    } else {
        console.log(`Session ${index} failed: ${result.reason}`);
    }
});
```

### Working with Timezones

RecallrAI SDK handles timezone conversions for you. When retrieving context with timezone information:

```typescript
import { RecallStrategy } from 'recallrai';

// Get context with timezone-aware timestamps
const context = await session.getContext(
    RecallStrategy.BALANCED,
    15,    // min_top_k
    50,    // max_top_k
    0.6,   // memories_threshold
    0.5,   // summaries_threshold
    10,    // last_n_messages
    5,     // last_n_summaries
    "America/New_York"  // Timestamps will be formatted in Eastern Time
);

// Context without timezone (UTC timestamps)
const contextUTC = await session.getContext();
```

### Working with Large Message Sets

For applications with high message volumes, use pagination effectively:

```typescript
// Retrieve messages in batches
let offset = 0;
const limit = 100;
let hasMore = true;

while (hasMore) {
    const messageList = await session.getMessages(offset, limit);
    
    // Process batch
    for (const message of messageList.messages) {
        console.log(`${message.role}: ${message.content}`);
    }
    
    hasMore = messageList.hasMore;
    offset += limit;
}
```

## Best Practices

### 1. Error Handling Strategy

Always handle specific exceptions to provide better user experience:

```typescript
import { 
    UserNotFoundError, 
    NetworkError, 
    AuthenticationError,
    RecallrAIError 
} from 'recallrai';

async function safeGetUser(userId: string) {
    try {
        return await client.getUser(userId);
    } catch (error) {
        if (error instanceof UserNotFoundError) {
            // Handle user not found - maybe create the user?
            console.log(`User ${userId} not found, creating...`);
            return await client.createUser(userId, {});
        } else if (error instanceof NetworkError) {
            // Handle network issues - maybe retry?
            console.log("Network issue, retrying in 5 seconds...");
            await new Promise(resolve => setTimeout(resolve, 5000));
            return await client.getUser(userId);
        } else if (error instanceof AuthenticationError) {
            // Handle auth issues - check API key
            console.error("Authentication failed - check your API key");
            throw error;
        } else if (error instanceof RecallrAIError) {
            // Handle any other RecallrAI errors
            console.error(`RecallrAI error: ${error.message}`);
            throw error;
        } else {
            // Handle unexpected errors
            console.error(`Unexpected error: ${error}`);
            throw error;
        }
    }
}
```

### 2. Session Management

Use appropriate session lifecycles and avoid leaving sessions unprocessed:

```typescript
// Good: Create session, add messages, process
const session = await user.createSession(300); // 5 minute auto-process
await session.addMessage(MessageRole.USER, "Hello!");
await session.addMessage(MessageRole.ASSISTANT, "Hi there!");
await session.process(); // Explicit processing

// Better: Use auto-processing for real-time conversations
const session = await user.createSession(60); // 1 minute auto-process
// Messages will be processed automatically
```

### 3. Memory Management

Be strategic about memory retrieval parameters:

```typescript
import { RecallStrategy } from 'recallrai';

// For chatbots: Use balanced strategy with recent context
const chatContext = await session.getContext(
    RecallStrategy.BALANCED,
    10,   // Fewer memories for faster response
    30,   // Reasonable maximum
    0.6,  // Standard threshold
    0.5,  // Standard threshold
    5,    // Recent messages for conversation flow
    3     // Recent summaries for context
);

// For deep analysis: Use deep strategy with more memories
const analysisContext = await session.getContext(
    RecallStrategy.DEEP,
    20,   // More memories for thorough analysis
    100,  // Maximum memories
    0.4,  // Lower threshold for broader recall
    0.3,  // Lower threshold for broader recall
    20,   // More messages for comprehensive context
    10    // More summaries for full picture
);
```

### 4. Merge Conflict Resolution

Handle merge conflicts proactively:

```typescript
// Check for merge conflicts after processing
const user = await client.getUser("user123");
const conflicts = await user.listMergeConflicts(0, 10, MergeConflictStatus.PENDING);

if (conflicts.total > 0) {
    console.log(`Found ${conflicts.total} pending merge conflicts`);
    
    for (const conflict of conflicts.conflicts) {
        // Auto-resolve simple conflicts or prompt user for complex ones
        if (conflict.clarifyingQuestions.length <= 2) {
            // Simple conflict - auto-resolve with default answers
            const answers = conflict.clarifyingQuestions.map(q => 
                new MergeConflictAnswer({
                    question: q.question,
                    answer: q.options[0],
                    message: "Auto-resolved with first option"
                })
            );
            await conflict.resolve(answers);
        } else {
            // Complex conflict - log for manual review
            console.log(`Complex conflict ${conflict.id} requires manual review`);
        }
    }
}
```

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions:

```typescript
import { 
    RecallrAI, 
    User, 
    Session, 
    SessionStatus,
    MessageRole,
    RecallStrategy,
    MergeConflict,
    MergeConflictStatus 
} from 'recallrai';

// All types are properly typed
const client: RecallrAI = new RecallrAI({ apiKey: "key", projectId: "id" });
const user: User = await client.getUser("user123");
const session: Session = await user.createSession(300, { type: "chat" });
const status: SessionStatus = session.status;
```

## API Reference

For complete API documentation, visit [docs.recallrai.com](https://docs.recallrai.com).

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: [docs.recallrai.com](https://docs.recallrai.com)
- **GitHub Issues**: [github.com/recallrai/sdk-node/issues](https://github.com/recallrai/sdk-node/issues)
- **Email Support**: <support@recallrai.com>

---

**Note**: This SDK is in active development. Please check the [changelog](CHANGELOG.md) for updates and breaking changes.

## Example Usage with LLMs

```typescript
import { RecallrAI, User, Session } from 'recallrai';
import OpenAI from 'openai';
import { UserNotFoundError, SessionNotFoundError } from 'recallrai/errors';
import * as readline from 'readline';

// Initialize the clients
const raiClient = new RecallrAI({
  apiKey: 'rai_yourapikey',
  projectId: 'your-project-uuid'
});
const oaiClient = new OpenAI({ apiKey: 'your-openai-api-key' });

// Create a readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions
function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function chatWithMemory(userId: string, sessionId?: string): Promise<string> {
  let user: User;
  let session: Session;
  
  // Get or create user
  try {
    user = await raiClient.getUser(userId);
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      user = await raiClient.createUser(userId);
    } else {
      throw error;
    }
  }
  
  // Create a new session or get an existing one
  if (sessionId) {
    try {
      session = await user.getSession(sessionId);
    } catch (error) {
      if (error instanceof SessionNotFoundError) {
        console.log(`Session ${sessionId} not found. Creating a new session.`);
        session = await user.createSession(30);
      } else {
        throw error;
      }
    }
  } else {
    session = await user.createSession(30);
    console.log(`Created new session: ${session.sessionId}`);
  }
  
  console.log("Chat session started. Type 'exit' to end the conversation.");
  
  while (true) {
    // Get user input
    const userMessage = await askQuestion("You: ");
    if (userMessage.toLowerCase() === 'exit') {
      break;
    }
    
    // Add the user message to RecallrAI
    await session.addUserMessage(userMessage);
    
    // Get context from RecallrAI after adding the user message
    const context = await session.getContext();
    
    // Create a system prompt that includes the context
    const systemPrompt = `You are a helpful assistant with memory of previous conversations.
    
    MEMORIES ABOUT THE USER:
    ${context.context}
    
    You can use the above memories to provide better responses to the user.
    Don't mention that you have access to memories unless you are explicitly asked.`;
    
    // Get previous messages
    const previousMessages = await session.getMessages();
    const formattedMessages = previousMessages.map(message => ({
      role: message.role,
      content: message.content
    }));

    // Call the LLM with the system prompt and conversation history
    const response = await oaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...formattedMessages,
      ],
      temperature: 0.7
    });
    
    const assistantMessage = response.choices[0].message.content;
    
    // Print the assistant's response
    console.log(`Assistant: ${assistantMessage}`);
    
    // Add the assistant's response to RecallrAI
    await session.addAssistantMessage(assistantMessage);
  }
  
  // Process the session at the end of the conversation
  console.log("Processing session to update memory...");
  await session.process();
  console.log(`Session ended. Session ID: ${session.sessionId}`);
  rl.close();
  return session.sessionId;
}

// Example usage
(async () => {
  try {
    const userId = "user123";
    // To continue a previous session, uncomment below and provide the session ID
    // const previousSessionId = "previously-saved-session-uuid";
    // const sessionId = await chatWithMemory(userId, previousSessionId);
    
    // Start a new session
    const sessionId = await chatWithMemory(userId);
    console.log(`To continue this conversation later, use session ID: ${sessionId}`);
  } catch (error) {
    console.error("Error:", error);
  }
})();
```

## Exception Handling

The RecallrAI SDK implements a comprehensive exception hierarchy to help you handle different error scenarios gracefully:

### Base Exception

- **RecallrAIError**: The base exception for all SDK-specific errors. All other exceptions inherit from this.

### Authentication Errors

- **AuthenticationError**: Raised when there's an issue with your API key or project ID authentication.

### Network-Related Errors

- **NetworkError**: Base exception for all network-related issues.
- **TimeoutError**: Occurs when a request takes too long to complete.
- **ConnectionError**: Happens when the SDK cannot establish a connection to the RecallrAI API.

### Server Errors

- **ServerError**: Base class for server-side errors.
- **InternalServerError**: Raised when the RecallrAI API returns a 5xx error code.

### User-Related Errors

- **UserError**: Base for all user-related exceptions.
- **UserNotFoundError**: Raised when attempting to access a user that doesn't exist.
- **UserAlreadyExistsError**: Occurs when creating a user with an ID that already exists.

### Session-Related Errors

- **SessionError**: Base for all session-related exceptions.
- **SessionNotFoundError**: Raised when attempting to access a non-existent session.
- **InvalidSessionStateError**: Occurs when performing an operation that's not valid for the current session state (e.g., adding a message to a processed session).

### Input Validation Errors

- **ValidationError**: Raised when provided data doesn't meet the required format or constraints.

### Importing Exceptions

You can import exceptions directly from the `recallrai/errors` module:

```typescript
// Import specific exceptions
import { UserNotFoundError, SessionNotFoundError } from 'recallrai/errors';

// Import all exceptions
import * as errors from 'recallrai/errors';
```

### Best Practices for Error Handling

When implementing error handling with the RecallrAI SDK, consider these best practices:

1. **Handle specific exceptions first**: Catch more specific exceptions before general ones.

   ```typescript
   try {
     // SDK operation
   } catch (error) {
     if (error instanceof UserNotFoundError) {
       // Specific handling
     } else if (error instanceof RecallrAIError) {
       // General fallback
     } else {
       // Unexpected errors
     }
   }
   ```

2. **Implement retry logic for transient errors**: Network and timeout errors might be temporary.

3. **Log detailed error information**: Exceptions contain useful information for debugging.

4. **Handle common user flows**: For example, check if a user exists before operations, or create them if they don't:

   ```typescript
   try {
     const user = await client.getUser(userId);
   } catch (error) {
     if (error instanceof UserNotFoundError) {
       const user = await client.createUser(userId);
     }
   }
   ```

For more detailed information on specific exceptions, refer to the API documentation.

## Conclusion

This README outlines the basic usage of the RecallrAI SDK functions for user and session management. For additional documentation and advanced usage, please see the [official documentation](https://recallrai.com) or the source code repository on [GitHub](https://github.com/recallrai/sdk-node).
