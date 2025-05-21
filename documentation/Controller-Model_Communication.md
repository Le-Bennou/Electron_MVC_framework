# Controller-Model Communication

## Architecture Overview
In this framework, components are split into three distinct parts running in different environments:

1. **Controller (Browser)**
   - Runs in the Chromium renderer process
   - Handles user interactions and view updates
   - Written in standard ES6+ JavaScript
   - Has access to DOM APIs

2. **Model (Node.js)**
   - Runs in the Node.js main process
   - Handles business logic and data operations
   - Has access to Node.js APIs (file system, network, etc.)
   - Written in ES6+ JavaScript with Node.js features

3. **View (HTML/CSS)**
   - Defines the component's appearance
   - Uses framework's design system
   - Isolated through Shadow DOM

### Component Instances
Each component instance in your HTML gets its own dedicated Model instance. This means:
```html
<!-- Each instance has its own independent model -->
<x-todolist id="work"></x-todolist>
<x-todolist id="personal"></x-todolist>
```
In this example:
- Each TodoList has its own Model instance
- Data and state are isolated between instances
- Models run independently in the Node.js process
- Perfect for components that need to maintain separate states

## Controller to Model Communication

### Simple Example
The simplest form of controller-model communication:

```javascript
// filepath: src/Components/Greeter/C_Greeter.js
export class Greeter_Controller extends abstractController {
    onReady() {
        this.model.getMessage()
            .then(message => {
                this.view['#display'].textContent = message;
            });
    }
}
```

```javascript
// filepath: src/Components/Greeter/M_Greeter.js
export class Greeter_Model extends AbstractModel {
    getMessage() {
        return "Hello World"; // Direct return is automatically wrapped in a Promise
    }
}
```

```html
<!-- filepath: src/Components/Greeter/V_Greeter.html -->
<div class="greeter">
    <p id="display"></p>
</div>
```

### File Reading Example
A more complex example showing file system operations:

```javascript
// filepath: src/Components/FileReader/C_FileReader.js
export class FileReader_Controller extends abstractController {
    setupEventListeners() {
        this.view['#readButton'].onClick = () => {
            const filepath = this.view.fileInput.value;
            
            this.model.readFile(filepath)
                .then(content => {
                    this.view['#content'].textContent = content;
                    this.view['#error'].textContent = '';
                })
                .catch(error => {
                    this.view['#error'].textContent = `Error: ${error.message}`;
                    this.view['#content'].textContent = '';
                });
        };
    }
}
```

```javascript
// filepath: src/Components/FileReader/M_FileReader.js
import { promises as fs } from 'fs';

export class FileReader_Model extends AbstractModel {
    readFile(filepath) {
        return fs.readFile(filepath, 'utf-8')
            .catch(error => {
                throw new Error(`Failed to read ${filepath}: ${error.message}`);
            });
    }
}
```

```html
<!-- filepath: src/Components/FileReader/V_FileReader.html -->
<div class="file-reader">
    <div class="input-group">
        <input id="fileInput" type="text" placeholder="Enter file path">
        <button id="readButton">Read File</button>
    </div>
    <pre id="content"></pre>
    <p id="error" class="error"></p>
</div>
```

### How It Works
- The framework creates a proxy between the controller and model
- When calling `this.model.someMethod()`:
  1. The call is intercepted by the proxy
  2. Parameters are serialized and sent to Node.js process
  3. The model executes the method
  4. Result is sent back to the controller
  5. Controller receives the result as a Promise

## Model to Controller Communication

While not recommended for typical MVC patterns, models can send messages directly to controllers in special cases (like external events or long-running operations).

### Example:

```javascript
// Model (Node.js)
export class FileWatcher_Model extends AbstractModel {
    startWatching(path) {
        fs.watch(path, (eventType, filename) => {
            // Send message to controller
            this.sendMessageToController('file-changed', {
                type: eventType,
                file: filename
            });
        });
    }
}
```

```javascript
// Controller (Browser)
export class FileWatcher_Controller extends abstractController {
    setupMessageListeners() {
        // Listen for model messages
        this.addMessageListener('file-changed', (data) => {
            this.view.status.textContent = `File ${data.file} was ${data.type}`;
        });
    }

    onReady() {
        this.model.startWatching('./myFolder');
    }
}
```

### Best Practices
1. Use controller-to-model communication as the primary pattern
2. Reserve model-to-controller messages for:
   - External events (file changes, device connections)
   - Progress updates for long operations
   - Real-time data updates
3. Keep the model focused on data and business logic
4. Let the controller handle UI updates and user interactions