# Electron MVC Framework

## Overview

This framework combines [Electron](https://en.wikipedia.org/wiki/Electron_(software_framework)) and the [MVC (Model-View-Controller)](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) pattern to create desktop applications using web technologies. It's designed to be beginner-friendly while maintaining powerful features.

### What is Electron?
Electron allows you to build cross-platform desktop applications using HTML, CSS, and JavaScript. Think of it as a way to turn web applications into desktop software that runs on Windows, Mac, or Linux.

### What is MVC?
MVC (Model-View-Controller) is a design pattern that separates your application into three main components:
- **Model**: Handles data and business logic
- **View**: Displays the user interface
- **Controller**: Manages user input and updates the Model and View

## Getting Started

### Installation
1. Unzip the framework files to your project folder
2. Open a terminal in the project folder
3. Run the following command:
```bash
npm install
```

### Running the Application
Start the application with:
```bash
npm run start
```

## Building Your Application

### Configuring the Main Window
1. Open `Main.js` to customize your application window
2. Configure window properties using [Electron's BrowserWindow options](https://www.electronjs.org/docs/latest/api/browser-window#new-browserwindowoptions)
   
Example:
```javascript
{
  width: 800,
  height: 600,
  title: "My App"
}
```

### Creating Components

Components in this framework are built using [Custom Elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements), making them reusable across your application. Each component is automatically registered as a custom element with a prefix defined in `config.js` (default: 'x-').

Usage in HTML:
```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<body>
    <!-- Using components with the defined prefix -->
    <x-helloworld></x-helloworld>
    <x-todolist list-name="My Tasks"></x-todolist>
    
    <!-- Components can be nested -->
    <x-panel>
        <x-button>Click me</x-button>
    </x-panel>
</body>
</html>
```

#### Basic Structure
1. Create a new folder in `Components/` (subfolders allowed)
2. Run the following command to register your components:
```bash
npm run updateComponents
```

#### Component Files
Each component consists of four files. All files must share the same base name as your component (e.g., for a component named "MyComponent"):

- `C_MyComponent.js`: Controller (runs in renderer process)
  - Runs in the renderer process (similar to a web browser)
  - Has access to DOM manipulation and web APIs
  - Can't directly access Node.js/system features
  - Communicates with the Model through IPC (Inter-Process Communication)

- `M_MyComponent.js`: Model (runs in Node.js main process)
  - Runs in the main process with full Node.js capabilities
  - Can access file system, network, and system APIs
  - Handles business logic and data operations
  - Cannot directly manipulate the DOM
  - Communicates with the Controller through IPC

- `V_MyComponent.html`: View template
  - Contains the component's HTML structure
  - Rendered in the renderer process

- `V_MyComponent.css`: Component styles
  - Styles specific to the component
  - Applied in the renderer process

Understanding Electron's Processes:
- **Main Process**: The Node.js process that runs your `main.js` file and has full system access
- **Renderer Process**: Like a web browser tab, isolated for security but with web capabilities
- **IPC (Inter-Process Communication)**: The bridge that allows safe communication between processes

Example component:

```HTML
<!-- View (V_HelloWorld.html) -->
<p id="message"></p>
```

```CSS
/* View (V_HelloWorld.css) */*
#message{
    font-size:25px;
}
```

```javascript
// Controller (C_HelloWorld.js)
class HelloWorld_Controller extends abstractController {
    onReady() {
        this.view['#message'].innerText = "Loading..."
        this.model.getMessage().then(msg => {
            this.view['#message'].innerText = msg
        });
    }
}
```

```javascript
// Controller (M_HelloWorld.js)
class HelloWorld_Controller extends abstractController {
    getMessage(){
        return "Hello World!"
    }
}
```

#### Using Components
Add components to your application using custom elements:
Customs Elements always needs prefix to work.
```html
<!-- Using the 'x-' prefix (configurable in config.js) -->
<x-helloworld></x-helloworld>
```

## Advanced Topics

For more detailed information, check out our documentation:

- [Built-in Components](documentation/BuitlinComponent.md)
  - Discover the pre-made components included with the framework
  - Learn how to use common UI elements and utilities

- [Controller-Model Communication](documentation/Controller-Model_Communication.md)
  - How to send and receive data between Controller and Model

- [Menu Creation](documentation/MenuCreation.md)
  - Creating application menus
  - Handling menu events and actions


- [Controller-View Communication](documentation/ConrtollerViewCommunication.md)
  - Working with the View proxy system
  - Event handling and DOM manipulation


