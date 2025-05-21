# Built in Component

The framework comes with several built-in components that provide essential functionalities for development and UI customization. These components are automatically available in your application and can be accessed through the application menu. They help streamline the development process and provide powerful tools for debugging and theming.

## Debug
The Debug component provides essential development tools and enhanced console logging capabilities:

### Features
1. **Developer Tools Access**
   - Quick access to Chrome DevTools through the Debug menu
   - Includes reload, force reload, and zoom controls
   - Allows inspection of DOM elements, network requests, and more

2. **Enhanced Console Logging**
   - Captures console messages (log, warn, error) from the Node.js backend
   - Displays them in the frontend's DevTools console
   - Each log message includes:
     - The source file path and line number
     - A Node.js icon to identify backend logs
     - Color coding (green for logs, yellow for warnings, red for errors)
     - Full object inspection capabilities
     - Function listings for objects

### How to Use
- Access DevTools using the Debug menu or press Ctrl+Shift+I
- Use console.log(), console.warn(), and console.error() as usual
- Backend logs will automatically appear in the frontend console


## UIConfig
The UIConfig component provides a comprehensive theming and styling interface:

### Features
1. **Theme Customization**
   - Toggle between light and dark color schemes
   - Customize primary colors with real-time preview
   - Adjust font sizes globally
   - Control spacing ratio which affects:
     - Padding and margins scaling
     - Typography hierarchy (h1, h2, h3, p...)

3. **Demo Page**
   - Provides a preview of all HTML elements
   - Shows how different components look with current theme
   - Helps visualize spacing and typography scales

### How to Use
- Access through "UI Maker" in the menu
- "Edit config" opens the configuration panel
- "Demo Page" shows the component preview
- "Save" allow to save your config in config.css
- Changes are applied in real-time