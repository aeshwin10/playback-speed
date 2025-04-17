// background.ts
// Background service worker for YouTube Playback Speed Manager

// Define interface for channel speed data
interface ChannelSpeed {
  channelName: string;
  speed: number;
  watchTime: number;
}

// Listen for tab updates (when a page loads or changes)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Check if the page has finished loading and is a YouTube video
  if (changeInfo.status === "complete" && tab.url && tab.url.includes("youtube.com/watch")) {
    console.log("YouTube video page detected, applying saved speed...");
    
    try {
      // Get saved channel speeds from storage
      const savedData = await chrome.storage.local.get("channelSpeeds");
      const channelSpeeds: ChannelSpeed[] = savedData.channelSpeeds || [];
      console.log("Retrieved saved channel speeds:", channelSpeeds);
      
      // Execute content script to apply the speed
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: applySpeedForChannel,
        args: [channelSpeeds]
      });
    } catch (error) {
      console.error("Error in background script:", error);
    }
  }
});

// This function runs in the context of the web page
function applySpeedForChannel(channelSpeeds: ChannelSpeed[]) {
  console.log("Running applySpeedForChannel with data:", channelSpeeds);
  
  // Helper function to detect channel name using multiple methods
  function getChannelName() {
    const selectors = [
      'ytd-channel-name a',
      '#top-row ytd-channel-name',
      '#owner-text a',
      '.ytd-video-owner-renderer .ytd-channel-name',
      'span[itemprop="author"] [itemprop="name"]',
      '#channel-name',
      '#meta-contents #channel-name .ytd-channel-name'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent) {
        const name = element.textContent.trim();
        if (name) return name;
      }
    }
    
    return null;
  }
    // Show notification when speed is applied
  function showNotification(speed: number) {
    const notification = document.createElement('div');
    notification.textContent = `Speed set to ${speed}x`;
    notification.style.cssText = `
      position: fixed;
      z-index: 9999;
      bottom: 60px;
      right: 20px;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-family: 'YouTube Sans', sans-serif;
      font-size: 14px;
      opacity: 1;
      transition: opacity 0.3s;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = "0";
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
  
  // Function to apply the saved speed with retries
  function attemptToApplySpeed(retryCount = 0, maxRetries = 10) {
    if (retryCount >= maxRetries) {
      console.log("Max retries reached, giving up on channel detection");
      return;
    }
    
    const channelName = getChannelName();
    if (!channelName) {
      console.log(`Attempt ${retryCount + 1}: Channel not detected yet, retrying in 1s...`);
      setTimeout(() => attemptToApplySpeed(retryCount + 1, maxRetries), 1000);
      return;
    }
    
    console.log("Channel detected:", channelName);
    
    // Find the saved speed for this channel
    const channelData = channelSpeeds.find(c => c.channelName === channelName);
    if (channelData && channelData.speed) {
      console.log(`Found saved speed ${channelData.speed}x for channel ${channelName}`);
      
      const video = document.querySelector('video');
      if (video) {
        // Apply the saved speed
        video.playbackRate = channelData.speed;
        console.log(`Applied speed ${channelData.speed}x to video`);
        
        // Show notification
        showNotification(channelData.speed);
      } else {
        console.log("No video element found");
      }
    } else {
      console.log(`No saved speed found for channel ${channelName}`);
    }
  }
  
  // Start the process
  attemptToApplySpeed();
}

// When the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log("YouTube Playback Speed Manager installed.");
});
