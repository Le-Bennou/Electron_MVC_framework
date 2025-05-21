# Inter-Component Communication

## Overview
In MVC architecture, components should be independent and loosely coupled. The framework provides a messaging system that allows components to communicate without direct dependencies.

## How It Works
The communication system works like a "message in a bottle" approach: components can send messages into the application's "ocean", and only components that are actively listening for specific message types will receive them. This decoupled approach means:

- Senders don't need to know who (if anyone) will receive their messages
- Messages are only received by components that explicitly listen for them
- Multiple components can listen to the same message type
- Components can start or stop listening at any time

### 1. Basic Communication
Components can send messages using the `sendMessage` method and listen for messages using `addMessageListener`:

```javascript
// Sender Component
export class Sender_Controller extends abstractController {
    onReady() {
        this.sendMessage({
            type: 'user-selected',
            message: { id: 123, name: 'John' }
        });
    }
}

// Receiver Component
export class Receiver_Controller extends abstractController {
    setupMessageListeners() {
        this.addMessageListener('user-selected', (message) => {
            console.log('User selected:', message);
            this.view.userName.textContent = message.name;
        });
    }
}
```

### 2. Message Broadcasting and Targeting
By default, messages without a `destinataires` property are broadcasted to all components. Components can then choose to listen or ignore these messages.

```javascript
// Broadcast to all components
this.sendMessage({
    type: 'app-state-changed',
    message: { state: 'ready' }
});

// Target specific components
this.sendMessage({
    type: 'update-data',
    message: { value: 42 },
    destinataires: '#userProfile'
});

// Target multiple components
this.sendMessage({
    type: 'theme-changed',
    message: 'dark',
    destinataires: ['.theme-aware', '.color-panel']
});
```

### 3. Request-Response Pattern
Components can respond to messages using the sender object:

```javascript
// Requester Component
export class DataRequester_Controller extends abstractController {
    async fetchUserData() {
        const [response] = await this.sendMessage({
            type: 'get-user-data',
            message: { userId: 123 },
            destinataires: '#userService'
        });
        
        this.view.userInfo.textContent = response.name;
    }
}

// Service Component
export class UserService_Controller extends abstractController {
    setupMessageListeners() {
        this.addMessageListener('get-user-data', (message, sender) => {
            const userData = this.model.getUser(message.userId);
            sender.reponse(userData);
        });
    }
}
```

## Best Practices

1. **Message Types**
   - Use clear, descriptive message types
   - Follow a consistent naming convention
   - Consider prefixing messages for specific domains

2. **Message Structure**
   - Keep message payload simple and serializable
   - Include necessary context in the message
   - Document expected message format

3. **Error Handling**
   - Handle cases where no receivers are listening
   - Implement timeouts for request-response patterns
   - Validate message format before sending

4. **Performance**
   - Avoid sending large payloads
   - Don't broadcast messages unnecessarily
   - Use targeted messages when possible

## Example: Theme Switcher

```javascript
// Theme Controller
export class ThemeManager_Controller extends abstractController {
    setupEventListeners() {
        this.view.darkMode.onClick = () => {
            this.sendMessage({
                type: 'theme-changed',
                message: 'dark',
                // Broadcast to all components
            });
        };
    }
}

// Any Component that needs theme awareness
export class Card_Controller extends abstractController {
    setupMessageListeners() {
        this.addMessageListener('theme-changed', (theme) => {
            this.view.container.className = `card ${theme}-mode`;
        });
    }
}
```