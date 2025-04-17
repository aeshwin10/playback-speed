# YouTube Playback Speed Manager

> **Save hours of your life by watching YouTube videos faster! The smart extension that remembers your preferences per channel.**

A browser extension that automatically applies your preferred playback speeds to YouTube videos based on channel, tracking how much time you've saved.

## Quick Start

1. Clone the repository:
   ```powershell
   git clone https://github.com/aeshwin10/playback-speed.git 
   cd playback-speed
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Build the extension:
   ```powershell
   npm run build
   ```

4. Load it in Chrome/Edge:
   - Go to extensions page (chrome://extensions) or (breave:://extensions)
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder
 ![image](https://github.com/user-attachments/assets/cfb7861c-0ad6-4ae9-b11c-d5a16631e934)
 ![image](https://github.com/user-attachments/assets/5d77da51-9282-4bb3-bece-33367ce69253)



## Features

- Automatically applies saved speeds when you visit a YouTube channel
- Tracks total time saved across all channels
- Clean, minimalist interface

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **Build**: Vite, PostCSS
- **Extension**: Chrome Extension Manifest V3

## Contributing

Contributions are welcome under the MIT License! Feel free to submit issues or pull requests.

## License

MIT License

---

_Because life's too short to watch YouTube at 1x speed!_
