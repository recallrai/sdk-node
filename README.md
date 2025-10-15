# RecallrAI Node.js SDK

Official Node.js SDK for RecallrAI – a revolutionary contextual memory system that enables AI assistants to form meaningful connections between conversations, just like human memory.

**Note:** All datetime objects returned by the SDK are JavaScript Date objects in UTC timezone.

## Installation

Install the SDK via npm or yarn:

```bash
npm install recallrai
# or
yarn add recallrai
```

## Initialization

Create a client instance with your API key and project ID:

```typescript
import { RecallrAI } from "recallrai";

const client = new RecallrAI({
	apiKey: "rai_yourapikey",
	projectId: "project-uuid",
	baseUrl: "https://api.recallrai.com", // custom endpoint if applicable
	timeout: 60, // seconds
});
```

## User Management

### Create a User

```typescript
import { UserAlreadyExistsError } from "recallrai";

try {
	const user = await client.createUser("user123", { name: "John Doe" });
	console.log(`Created user: ${user.userId}`);
	console.log(`User metadata:`, user.metadata);
	console.log(`Created at: ${user.createdAt}`);
} catch (error) {
	if (error instanceof UserAlreadyExistsError) {
		console.log(`Error: ${error.message}`);
	}
}
```

### Get a User

```typescript
import { UserNotFoundError } from "recallrai";

try {
	const user = await client.getUser("user123");
	console.log(`User metadata:`, user.metadata);
	console.log(`Last active: ${user.lastActiveAt}`);
} catch (error) {
	if (error instanceof UserNotFoundError) {
		console.log(`Error: ${error.message}`);
	}
}
```

### List Users

```typescript
const userList = await client.listUsers({
	offset: 0,
	limit: 10,
	metadataFilter: { role: "admin" },
});

console.log(`Total users: ${userList.total}`);
console.log(`Has more users: ${userList.hasMore}`);
console.log("---");

for (const u of userList.users) {
	console.log(`User ID: ${u.userId}`);
	console.log(`Metadata:`, u.metadata);
	console.log(`Created at: ${u.createdAt}`);
	console.log(`Last active: ${u.lastActiveAt}`);
	console.log("---");
}
```

### Update a User

```typescript
import { UserNotFoundError, UserAlreadyExistsError } from "recallrai";

try {
	const user = await client.getUser("user123");
	await user.update({
		newMetadata: { name: "John Doe", role: "admin" },
		newUserId: "john_doe",
	});
	console.log(`Updated user ID: ${user.userId}`);
	console.log(`Updated metadata:`, user.metadata);
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
import { UserNotFoundError } from "recallrai";

try {
	const user = await client.getUser("john_doe");
	await user.refresh();
	console.log(`Refreshed user metadata:`, user.metadata);
	console.log(`Last active: ${user.lastActiveAt}`);
} catch (error) {
	if (error instanceof UserNotFoundError) {
		console.log(`Error: ${error.message}`);
	}
}
```

### Delete a User

```typescript
import { UserNotFoundError } from "recallrai";

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
import { UserNotFoundError } from "recallrai";

try {
	const user = await client.getUser("user123");

	const session = await user.createSession({
		autoProcessAfterSeconds: 600,
		metadata: { type: "chat" },
	});
	console.log("Created session id:", session.sessionId);
} catch (error) {
	if (error instanceof UserNotFoundError) {
		console.log(`Error: ${error.message}`);
	}
}
```

### Get an Existing Session

```typescript
import { UserNotFoundError, SessionNotFoundError } from "recallrai";

try {
	const user = await client.getUser("user123");

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
import { UserNotFoundError, SessionNotFoundError } from "recallrai";

try {
	const user = await client.getUser("user123");
	const session = await user.getSession("session-uuid");

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
import { UserNotFoundError, SessionNotFoundError } from "recallrai";

try {
	const user = await client.getUser("user123");
	const session = await user.getSession("session-uuid");

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
import { SessionStatus, UserNotFoundError } from "recallrai";

try {
	const user = await client.getUser("user123");

	const sessionList = await user.listSessions({
		offset: 0,
		limit: 10,
		metadataFilter: { type: "chat" },
		statusFilter: [SessionStatus.PENDING, SessionStatus.PROCESSING],
	});

	console.log(`Total sessions: ${sessionList.total}`);
	console.log(`Has more sessions: ${sessionList.hasMore}`);
	for (const s of sessionList.sessions) {
		console.log(s.sessionId, s.status, s.metadata);
	}
} catch (error) {
	if (error instanceof UserNotFoundError) {
		console.log(`Error: ${error.message}`);
	}
}
```

### Session – Adding Messages

```typescript
import { UserNotFoundError, SessionNotFoundError, InvalidSessionStateError, MessageRole } from "recallrai";

try {
	await session.addMessage(MessageRole.USER, "Hello! How are you?");

	await session.addMessage(MessageRole.ASSISTANT, "I'm an assistant. How can I help you?");
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
import { UserNotFoundError, SessionNotFoundError, RecallStrategy } from "recallrai";

try {
	let context = await session.getContext();
	console.log("Context:", context.context);

	context = await session.getContext({
		recallStrategy: RecallStrategy.LOW_LATENCY,
	});
	console.log("Context:", context.context);

	context = await session.getContext({
		recallStrategy: RecallStrategy.BALANCED,
		minTopK: 10,
		maxTopK: 100,
		memoriesThreshold: 0.6,
		summariesThreshold: 0.5,
		lastNMessages: 20,
		lastNSummaries: 5,
		timezone: "America/Los_Angeles",
	});
	console.log("Context:", context.context);
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
import { UserNotFoundError, SessionNotFoundError, InvalidSessionStateError } from "recallrai";

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
import { UserNotFoundError, SessionNotFoundError } from "recallrai";

try {
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
import { UserNotFoundError, InvalidCategoriesError } from "recallrai";

try {
	const user = await client.getUser("user123");

	const memories = await user.listMemories({
		categories: ["food_preferences", "allergies"],
		sessionIdFilter: ["session-uuid-1", "session-uuid-2"], // optional: filter by specific sessions
		sessionMetadataFilter: { environment: "production" }, // optional: filter by session metadata
		offset: 0,
		limit: 20,
		includePreviousVersions: true,
		includeConnectedMemories: true,
	});

	for (const mem of memories.items) {
		console.log(`Memory ID: ${mem.memoryId}`);
		console.log(`Categories: ${mem.categories}`);
		console.log(`Content: ${mem.content}`);
		console.log(`Created at: ${mem.createdAt}`);
		console.log(`Session ID: ${mem.sessionId}`);

		console.log(`Version: ${mem.versionNumber} of ${mem.totalVersions}`);
		console.log(`Has previous versions: ${mem.hasPreviousVersions}`);

		if (mem.previousVersions) {
			console.log(`Previous versions: ${mem.previousVersions.length}`);
			for (const version of mem.previousVersions) {
				console.log(`  - Version ${version.versionNumber}: ${version.content}`);
				console.log(`    Created: ${version.createdAt}, Expired: ${version.expiredAt}`);
				console.log(`    Expiration reason: ${version.expirationReason}`);
			}
		}

		if (mem.connectedMemories) {
			console.log(`Connected memories: ${mem.connectedMemories.length}`);
			for (const connected of mem.connectedMemories) {
				console.log(`  - ${connected.memoryId}: ${connected.content}`);
			}
		}

		console.log(`Merge conflict in progress: ${mem.mergeConflictInProgress}`);
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

```typescript
import { UserNotFoundError } from "recallrai";

try {
	const user = await client.getUser("user123");

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

### List Merge Conflicts

```typescript
import { UserNotFoundError, MergeConflictStatus } from "recallrai";

try {
	const user = await client.getUser("user123");

	const conflicts = await user.listMergeConflicts({
		offset: 0,
		limit: 10,
		status: MergeConflictStatus.PENDING,
		sortBy: "created_at",
		sortOrder: "desc",
	});

	console.log(`Total conflicts: ${conflicts.total}`);
	console.log(`Has more: ${conflicts.hasMore}`);

	for (const conf of conflicts.conflicts) {
		console.log(`Conflict ID: ${conf.conflictId}`);
		console.log(`Status: ${conf.status}`);
		console.log(`New memory: ${conf.newMemoryContent}`);
		console.log(`Conflicting memories: ${conf.conflictingMemories.length}`);
		console.log(`Questions: ${conf.clarifyingQuestions.length}`);
		console.log(`Created at: ${conf.createdAt}`);
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
import { UserNotFoundError, MergeConflictNotFoundError } from "recallrai";

try {
	const user = await client.getUser("user123");
	const conflict = await user.getMergeConflict("conflict-uuid");

	console.log(`Conflict ID: ${conflict.conflictId}`);
	console.log(`Status: ${conflict.status}`);
	console.log(`New memory content: ${conflict.newMemoryContent}`);

	console.log("\nConflicting memories:");
	for (const mem of conflict.conflictingMemories) {
		console.log(`  Content: ${mem.content}`);
		console.log(`  Reason: ${mem.reason}`);
		console.log();
	}

	console.log("Clarifying questions:");
	for (const ques of conflict.clarifyingQuestions) {
		console.log(`  Question: ${ques.question}`);
		console.log(`  Options: ${ques.options}`);
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
	ValidationError,
} from "recallrai";

try {
	const user = await client.getUser("user123");
	const conflict = await user.getMergeConflict("conflict-uuid");

	const answers = [];
	for (const ques of conflict.clarifyingQuestions) {
		console.log(`  Question: ${ques.question}`);
		console.log(`  Options: ${ques.options}`);
		console.log();

		answers.push({
			question: ques.question,
			answer: ques.options[0],
			message: "User prefers this option based on recent conversation",
		});
	}

	await conflict.resolve(answers);
	console.log(`Conflict resolved! Status: ${conflict.status}`);
	console.log(`Resolved at: ${conflict.resolvedAt}`);

	if (conflict.resolutionData) {
		console.log(`Resolution data:`, conflict.resolutionData);
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
import { UserNotFoundError, MergeConflictNotFoundError } from "recallrai";

try {
	const user = await client.getUser("user123");
	const conflict = await user.getMergeConflict("conflict-uuid");

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

## Example Usage with LLMs

```typescript
import OpenAI from "openai";
import { RecallrAI, UserNotFoundError, MessageRole } from "recallrai";

const raiClient = new RecallrAI({
	apiKey: "rai_yourapikey",
	projectId: "your-project-uuid",
});

const oaiClient = new OpenAI({
	apiKey: "your-openai-api-key",
});

async function chatWithMemory(userId: string, sessionId?: string) {
	let user;
	try {
		user = await raiClient.getUser(userId);
	} catch (error) {
		if (error instanceof UserNotFoundError) {
			user = await raiClient.createUser(userId);
		} else {
			throw error;
		}
	}

	let session;
	if (sessionId) {
		session = await user.getSession(sessionId);
	} else {
		session = await user.createSession({ autoProcessAfterSeconds: 1800 });
		console.log(`Created new session: ${session.sessionId}`);
	}

	console.log("Chat session started. Type 'exit' to end the conversation.");

	const readline = require("readline");
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	const askQuestion = (query: string): Promise<string> => {
		return new Promise((resolve) => rl.question(query, resolve));
	};

	while (true) {
		const userMessage = await askQuestion("You: ");
		if (userMessage.toLowerCase() === "exit") {
			break;
		}

		await session.addMessage(MessageRole.USER, userMessage);

		const context = await session.getContext();

		const systemPrompt = "You are a helpful assistant" + context.context;

		const messagesData = await session.getMessages(0, 50);
		const previousMessages = messagesData.messages.map((message) => ({
			role: message.role,
			content: message.content,
		}));

		const response = await oaiClient.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [{ role: "system", content: systemPrompt }, ...previousMessages],
			temperature: 0.7,
		});

		const assistantMessage = response.choices[0].message.content || "";

		console.log(`Assistant: ${assistantMessage}`);

		await session.addMessage(MessageRole.ASSISTANT, assistantMessage);
	}

	rl.close();

	console.log("Processing session to update memory...");
	await session.process();
	console.log(`Session ended. Session ID: ${session.sessionId}`);
	return session.sessionId;
}

chatWithMemory("user123").then((sessionId) => {
	console.log(`To continue this conversation later, use session ID: ${sessionId}`);
});
```

## Exception Handling

The RecallrAI SDK implements a comprehensive exception hierarchy to help you handle different error scenarios gracefully.

### Available Exceptions

- **RecallrAIError**: Base exception for all SDK-specific errors
- **AuthenticationError**: Authentication issues with API key or project ID
- **TimeoutError**: Request timeout
- **ConnectionError**: Connection issues to the API
- **InternalServerError**: API returns 5xx error
- **RateLimitError**: API rate limit exceeded
- **UserNotFoundError**: User doesn't exist
- **UserAlreadyExistsError**: User creation with existing ID
- **InvalidCategoriesError**: Invalid memory categories
- **SessionNotFoundError**: Session doesn't exist
- **InvalidSessionStateError**: Invalid operation for session state
- **MergeConflictNotFoundError**: Merge conflict doesn't exist
- **MergeConflictAlreadyResolvedError**: Conflict already processed
- **MergeConflictInvalidQuestionsError**: Invalid clarifying questions
- **MergeConflictMissingAnswersError**: Missing required answers
- **MergeConflictInvalidAnswerError**: Invalid answer option
- **ValidationError**: Request validation failure

### Importing Exceptions

```typescript
import {
	UserNotFoundError,
	SessionNotFoundError,
	InvalidCategoriesError,
	MergeConflictNotFoundError,
	MergeConflictAlreadyResolvedError,
} from "recallrai";
```

### Best Practices for Error Handling

```typescript
try {
	// SDK operation
} catch (error) {
	if (error instanceof UserNotFoundError) {
		// Specific handling
	} else if (error instanceof RecallrAIError) {
		// General fallback
	}
}
```

## Conclusion

This README outlines the basic usage of the RecallrAI SDK functions for user and session management. For additional documentation and advanced usage, please see the [official documentation](https://docs.recallrai.com) or the source code repository on [GitHub](https://github.com/recallrai/sdk-node).
