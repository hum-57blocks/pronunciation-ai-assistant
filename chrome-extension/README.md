# Text Pronunciation Chrome Extension

This Chrome extension allows users to select text on any webpage and hear its pronunciation.

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the directory containing these files
5. The extension should now appear in your Chrome toolbar

## Usage

1. Select any text on a webpage
2. Right-click the selected text
3. Click "Pronounce Text" from the context menu
4. The audio pronunciation will play automatically

## Note

Currently using a mock API endpoint. Replace the `apiUrl` in `background.js` with your actual pronunciation API endpoint. 