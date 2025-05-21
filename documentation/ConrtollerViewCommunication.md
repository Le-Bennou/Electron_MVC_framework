# Controller-View Communication

## DOM Access and Manipulation
Each controller has direct access to its view's DOM elements through a streamlined API. This system provides an intuitive way to interact with the view while maintaining clean and readable code.

> Note: For simplicity, these examples focus on View-Controller interaction. In a real application, data management should be handled by the Model component of the MVC pattern.

### Basic Example
A component is split into multiple files:

```javascript
// filepath: src/Components/LightSwitch/C_LightSwitch.js
export class LightSwitch_Controller extends abstractController {
    onReady() {
        // Direct DOM access
        this.view.status.textContent = "OFF";
    }

    setupEventListeners() {
        // Easy event binding
        this.view['#toggle'].onClick = () => {
            const isOn = this.view.status.textContent === "ON";
            this.view['#status'].textContent = isOn ? "OFF" : "ON";
            this.view['#toggle'].textContent = isOn ? "Turn On" : "Turn Off";
        };
    }
}
```

```html
<!-- filepath: src/Components/LightSwitch/V_LightSwitch.html -->
<div class="switch">
    <p id="status">OFF</p>
    <button id="toggle">Turn On</button>
</div>
```

```css
/* filepath: src/Components/LightSwitch/V_LightSwitch.css */
.switch {
    padding: var(--spacing-M);
    text-align: center;
}
```

### More Complex Example

```javascript
// filepath: src/Components/TodoList/C_TodoList.js
export class TodoList_Controller extends abstractController {
    onReady() {
        this.view['#title'].textContent = this.getAttribute('list-name') || 'Todo List';
    }

    setupEventListeners() {
        this.view['#newTask'].onKeyUp = (e) => {
            if (e.key === 'Enter') this.addTask();
        };
        
        this.view['#addButton'].onClick = () => this.addTask();
        
        this.view['#clearButton'].onClick = () => {
            this.view['#taskList'].innerHTML = '';
        };
    }

    addTask() {
        const text = this.view['#newTask'].value;
        if (!text) return;

        const li = document.createElement('li');
        li.textContent = text;
        this.view['#taskList'].appendChild(li);
        this.view['#newTask'].value = '';
    }
}
```

```html
<!-- filepath: src/Components/TodoList/V_TodoList.html -->
<div class="todo-container">
    <h2 id="title">Todo List</h2>
    <div class="input-group">
        <input id="newTask" type="text" placeholder="Add new task">
        <button id="addButton">Add</button>
    </div>
    <ul id="taskList"></ul>
</div>
```

```css
/* filepath: src/Components/TodoList/V_TodoList.css */
.todo-container {
    padding: var(--spacing-M);
    background: var(--bg-surface-a10);
    border-radius: var(--border-radius-M);
}

.input-group {
    display: flex;
    gap: var(--spacing-S);
    margin: var(--spacing-M) 0;
}

#taskList {
    list-style: none;
    padding: 0;
}

#taskList li {
    padding: var(--spacing-S);
    margin: var(--spacing-XS) 0;
    background: var(--bg-surface-a0);
    border-radius: var(--border-radius-S);
}
```

### View Update Method
The framework provides a convenient way to update multiple DOM elements at once using the `view.update()` method. This method accepts a data object where keys correspond to element IDs or class names in the view.

#### Basic Example
```javascript
// Update elements by their IDs
this.view.update({
    '#status': "Active",
    '#counter': "42",
    '#username': "John Doe"
});
```

This will update all elements with matching IDs in the view:
```html
<p id="status">Active</p>
<span id="counter">42</span>
<div id="username">John Doe</div>
```

#### Array Updates
You can update multiple elements with the same class name using arrays:

```javascript
// Update elements with class="item"
this.view.update({
    '.item': ['First', 'Second', 'Third']
});
```

This will update elements in order:
```html
<span class="item">First</span>
<span class="item">Second</span>
<span class="item">Third</span>
```

#### Nested Updates
The update method also supports nested objects for complex DOM structures:

```javascript
this.view.update({
    userCard: {
        '#name': "John Doe",
        '#details': {
            '#age': "30",
            '#email': "john@example.com"
        }
    }
});
```

Which updates corresponding nested elements:
```html
<div id="userCard">
    <span id="name">John Doe</span>
    <div id="details">
        <span id="age">30</span>
        <span id="email">john@example.com</span>
    </div>
</div>
```

> Note: The update method automatically handles different element types:
> - For input/textarea elements: updates the `value` property
> - For img elements: updates the `src` property
> - For all other elements: updates the `innerHTML`

The framework automatically:
- Links these files together
- Creates the component as a custom element
- Provides the view proxy through `this.view`
- Handles Shadow DOM encapsulation
- Manages CSS scoping