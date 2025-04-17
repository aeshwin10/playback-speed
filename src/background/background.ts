// background.ts
// (Optional) Background logic for the extension (MV3 service worker)

chrome.runtime.onInstalled.addListener(() => {
  // Initialization logic if needed
  console.log('YouTube Playback Speed Manager installed.');
});
