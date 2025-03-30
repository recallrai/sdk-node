# RecallrAI Node.js SDK

Official Node.js SDK for RecallrAI – a revolutionary contextual memory system that enables AI assistants to form meaningful connections between conversations, just like human memory.

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

const apiKey = "rai_yourapikey"; 
const projectId = "project-uuid";
const client = new RecallrAI({ apiKey, projectId });
```

## User Management

### Create a User

```typescript
import { UserAlreadyExistsError } from 'recallrai/errors';

try {
  const user = await client.createUser("user123", { name: "John Doe" });
  console.log(`Created user: ${user.userId}`);
  console.log(`User metadata: ${JSON.stringify(user.metadata)}`);
  console.log(`Created at: ${user.createdAt}`);
} catch (error) {
  if (error instanceof UserAlreadyExistsError) {
    console.log(`Error: ${error.message}`);
  } else {
    console.error(`Unexpected error: ${error}`);
  }
}
```

### Get a User

```typescript
import { UserNotFoundError } from 'recallrai/errors';

try {
  const user = await client.getUser("user123");
  console.log(`User metadata: ${JSON.stringify(user.metadata)}`);
  console.log(`Last active: ${user.lastActiveAt}`);
} catch (error) {
  if (error instanceof UserNotFoundError) {
    console.log(`Error: ${error.message}`);
  } else {
    console.error(`Unexpected error: ${error}`);
  }
}
```

### List Users

```typescript
const userList = await client.listUsers(0, 10);
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
import { UserNotFoundError, UserAlreadyExistsError } from 'recallrai/errors';

try {
  const user = await client.getUser("user123");
  const updatedUser = await user.update(
    { name: "John Doe", role: "admin" },  // new metadata
    "john_doe"  // new user ID
  );
  console.log(`Updated user ID: ${updatedUser.userId}`);
  console.log(`Updated metadata: ${JSON.stringify(updatedUser.metadata)}`);
} catch (error) {
  if (error instanceof UserNotFoundError) {
    console.log(`Error: ${error.message}`);
  } else if (error instanceof UserAlreadyExistsError) {
    console.log(`Error: ${error.message}`);
  } else {
    console.error(`Unexpected error: ${error}`);
  }
}
```

### Delete a User

```typescript
import { UserNotFoundError } from 'recallrai/errors';

try {
  const user = await client.getUser("john_doe");
  await user.delete();
  console.log("User deleted successfully");
} catch (error) {
  if (error instanceof UserNotFoundError) {
    console.log(`Error: ${error.message}`);
  } else {
    console.error(`Unexpected error: ${error}`);
  }
}
```

## Session Management

### Create a Session

```typescript
import { UserNotFoundError } from 'recallrai/errors';
import { Session } from 'recallrai';

try {
  // First, get the user
  const user = await client.getUser("user123");
  
  // Create a session for the user; autoProcessAfterMinutes set to -1 disables auto-processing
  const session = await user.createSession(5);
  console.log("Created session id:", session.sessionId);
} catch (error) {
  if (error instanceof UserNotFoundError) {
    console.log(`Error: ${error.message}`);
  } else {
    console.error(`Unexpected error: ${error}`);
  }
}
```

### Get an Existing Session

```typescript
import { UserNotFoundError, SessionNotFoundError } from 'recallrai/errors';

try {
  // First, get the user
  const user = await client.getUser("user123");
  
  // Retrieve an existing session by its ID
  const session = await user.getSession("session-uuid");
  const status = await session.getStatus();
  console.log("Session status:", status);
} catch (error) {
  if (error instanceof UserNotFoundError) {
    console.log(`Error: ${error.message}`);
  } else if (error instanceof SessionNotFoundError) {
    console.log(`Error: ${error.message}`);
  } else {
    console.error(`Unexpected error: ${error}`);
  }
}
```

### List Sessions

```typescript
import { UserNotFoundError } from 'recallrai/errors';

try {
  // First, get the user
  const user = await client.getUser("user123");
  
  // List sessions for this user
  const sessionList = await user.listSessions(0, 10);
  for (const session of sessionList.sessions) {
    console.log(session.sessionId, session.status);
  }
} catch (error) {
  if (error instanceof UserNotFoundError) {
    console.log(`Error: ${error.message}`);
  } else {
    console.error(`Unexpected error: ${error}`);
  }
}
```

### Session – Adding Messages

```typescript
import { 
  UserNotFoundError, 
  SessionNotFoundError, 
  InvalidSessionStateError 
} from 'recallrai/errors';

try {
  // Add a user message
  await session.addUserMessage("Hello! How are you?");
  
  // Add an assistant message
  await session.addAssistantMessage("I'm an assistant. How can I help you?");
} catch (error) {
  if (error instanceof UserNotFoundError) {
    console.log(`Error: ${error.message}`);
  } else if (error instanceof SessionNotFoundError) {
    console.log(`Error: ${error.message}`);
  } else if (error instanceof InvalidSessionStateError) {
    console.log(`Error: ${error.message}`);
  } else {
    console.error(`Unexpected error: ${error}`);
  }
}
```

### Session – Retrieving Context

```typescript
import { UserNotFoundError, SessionNotFoundError } from 'recallrai/errors';

try {
  const context = await session.getContext();
  console.log("Memory used:", context.memoryUsed);
  console.log("Context:", context.context);
} catch (error) {
  if (error instanceof UserNotFoundError) {
    console.log(`Error: ${error.message}`);
  } else if (error instanceof SessionNotFoundError) {
    console.log(`Error: ${error.message}`);
  } else {
    console.error(`Unexpected error: ${error}`);
  }
}
```

### Session – Process Session

```typescript
import { 
  UserNotFoundError, 
  SessionNotFoundError, 
  InvalidSessionStateError 
} from 'recallrai/errors';

try {
  await session.process();
} catch (error) {
  if (error instanceof UserNotFoundError) {
    console.log(`Error: ${error.message}`);
  } else if (error instanceof SessionNotFoundError) {
    console.log(`Error: ${error.message}`);
  } else if (error instanceof InvalidSessionStateError) {
    console.log(`Error: ${error.message}`);
  } else {
    console.error(`Unexpected error: ${error}`);
  }
}
```

### Session – Get Status and Messages

```typescript
import { UserNotFoundError, SessionNotFoundError } from 'recallrai/errors';
import { SessionStatus } from 'recallrai';

try {
  const status = await session.getStatus();
  console.log("Session status:", status);
  
  // Check if the session is in a specific state
  if (status === SessionStatus.PROCESSED) {
    console.log("Session has been processed");
  }
  
  const messages = await session.getMessages();
  for (const message of messages) {
    console.log(`${message.role}: ${message.content} at ${message.timestamp}`);
  }
} catch (error) {
  if (error instanceof UserNotFoundError) {
    console.log(`Error: ${error.message}`);
  } else if (error instanceof SessionNotFoundError) {
    console.log(`Error: ${error.message}`);
  } else {
    console.error(`Unexpected error: ${error}`);
  }
}
```

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
