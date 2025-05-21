# Menu Creation

## Overview
The framework allows each component to contribute to the application's menu bar. Multiple components can modify the menu structure while maintaining a clean and organized layout.

For complete menu item options, see the [Electron Menu documentation](https://www.electronjs.org/docs/latest/api/menu#menuitem).

### Key Features
- Each component can add its own menu entries
- Menu items are automatically merged if they share the same label
- The 'order' property controls the position of main menu items
- Menu clicks are automatically routed to the component that created them

## Basic Usage

```javascript
// Inside your component's controller
setupMenu() {
    this.addMenuEntry({
        label: "File",
        order: 1,  // Lower numbers appear first
        submenu: [
            {
                label: "New Document",
                click: () => this.createDocument()
            },
            {
                label: "Save",
                click: () => this.saveDocument()
            }
        ]
    });
}
```

## Advanced Features

### Menu Item Types
```javascript
setupMenu() {
    this.addMenuEntry({
        label: "Tools",
        order: 2,
        submenu: [
            {
                label: "Enable Feature",
                type: "checkbox",  // Creates a toggleable item
                checked: true,
                click: () => this.toggleFeature()
            },
            { type: "separator" }, // Adds a line separator
            {
                label: "Sub Menu",
                submenu: [        // Creates a nested menu
                    { label: "Item 1" },
                    { label: "Item 2" }
                ]
            }
        ]
    });
}
```

### Multiple Menu Items
```javascript
setupMenu() {
    this.addMenuEntry([
        {
            label: "File",
            order: 1,
            submenu: [/* items */]
        },
        {
            label: "Edit",
            order: 2,
            submenu: [/* items */]
        }
    ]);
}
```

## Best Practices
1. Use meaningful 'order' values to organize menu items
2. Group related functionality under the same main menu
3. Use separators to organize long submenus
4. Implement keyboard shortcuts for common actions
5. Use standard menu labels when appropriate (File, Edit, View, etc.)
6. Keep submenus to a reasonable depth (max 2-3 levels)

## Menu Item Properties
- `label`: Text displayed in the menu
- `order`: Position in the menu bar (lower numbers first)
- `submenu`: Array of child menu items
- `type`: 'normal', 'separator', 'submenu', 'checkbox', or 'radio'
- `checked`: Boolean for checkbox/radio items
- `enabled`: Boolean to enable/disable the item
- `click`: Function to handle menu item selection