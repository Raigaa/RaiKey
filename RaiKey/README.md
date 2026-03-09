# RaiKey

**RaiKey** is a Firefox productivity extension that allows you to execute quick actions via fully customizable keyboard shortcuts.

## Features

### MVP (v1.0.1)
- **Detach Tab**: Instantly detach the active tab into a new window
- **Default Shortcut**: `Ctrl+Shift+U`
- **Customization**: Intuitive interface to modify shortcuts
- **Smart Validation**: Automatic detection of shortcut conflicts

## Installation

### From Mozilla Add-ons (Recommended)
*Coming Soon - The extension will be published on the official Mozilla store shortly*

### Manual Installation (Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/Raigaa/RaiKey.git
   cd RaiKey
   ```

2. **Load extension in Firefox**
   - Open Firefox and go to `about:debugging`
   - Click on "This Firefox"
   - Click on "Load Temporary Add-on..."
   - Select the `manifest.json` file in the RaiKey folder

3. **Enjoy!**
   - The extension is now active
   - Open settings via the extension button or `about:addons`

## Usage

### Using the Default Shortcut
1. Open any web page in a tab
2. Press `Ctrl+Shift+U`
3. The tab automatically detaches into a new window

### Customizing Shortcuts
1. Click the RaiKey icon in the toolbar
2. Go to "Options" or "Settings"
3. Click on the shortcut field for the action you want to modify
4. Press the new key combination (e.g., `Ctrl+Alt+D`)
5. Click "Save"

### Shortcut Tips
- Always use a modifier key (`Ctrl`, `Alt`, `Shift`)
- Avoid native Firefox shortcuts (e.g., `Ctrl+T`, `Ctrl+W`)
- Shortcuts must be unique
- Recommended format: `Ctrl+Shift+[Letter]`

## Development

### Project Structure
```
RaiKey/
├── manifest.json           # Extension configuration
├── background.js           # Background script (shortcut handling)
├── src/
│   ├── actions/
│   │   └── detachTab.js   # Detach tab action
│   ├── storage/
│   │   └── settings.js    # Settings management
│   └── options/
│       ├── options.html   # Settings interface
│       ├── options.css    # Styles
│       └── options.js     # UI logic
└── icons/
    ├── icon-48.png
    └── icon-96.png
```

### Technologies Used
- **Vanilla JavaScript** (ES6+)
- **WebExtensions API** (Firefox)
- **Browser Storage API** (Sync)
- **Browser Commands API** (Shortcuts)

## Permissions

The extension requires the following permissions:
- **`tabs`**: To manage and detach tabs
- **`storage`**: To save your custom settings
- **`commands`**: To register keyboard shortcuts

All these permissions are standard for this type of extension and necessary for proper functioning.

## Roadmap

### Version 1.0 (MVP) ✓
- [x] Tab Detachment
- [x] Customization Interface
- [x] Settings Sync

### Future Versions
- [ ] Duplicate Tab
- [ ] Pin/Unpin Tab
- [ ] Close tabs to the right/left
- [ ] Group tabs by domain
- [ ] Quick Screenshots
- [ ] Search open tabs
- [ ] Tab session management

## Contribution

Contributions are welcome! Feel free to:
1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Raigaa**
- GitHub: [@Raigaa](https://github.com/Raigaa)