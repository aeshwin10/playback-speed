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
  // Check if the URL is a YouTube video (even before the page is fully loaded)
  if (tab.url && tab.url.includes("youtube.com/watch")) {
    console.log("YouTube video URL detected:", tab.url);
    
    // If the page is loading, wait for it to complete
    if (changeInfo.status === "complete") {
      console.log("Page fully loaded, applying playback speed...");
      
      try {
        // Get saved channel speeds from storage
        const savedData = await chrome.storage.local.get("channelSpeeds");
        const channelSpeeds: ChannelSpeed[] = savedData.channelSpeeds || [];
        console.log("Retrieved saved channel speeds:", channelSpeeds.length);
        
        // Execute content script to apply the speed - run immediately
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: applySpeedForChannel,
          args: [channelSpeeds]
        });
        
        // Also set up a delayed execution to handle cases where YouTube loads content dynamically
        setTimeout(() => {
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: applySpeedForChannel,
            args: [channelSpeeds]
          }).catch(e => console.error("Error in delayed script execution:", e));
        }, 2000);  // Try again after 2 seconds
        
        // And try once more after a longer delay for really slow loads
        setTimeout(() => {
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: applySpeedForChannel,
            args: [channelSpeeds]
          }).catch(e => console.error("Error in final script execution:", e));
        }, 5000);  // Try again after 5 seconds
        
      } catch (error) {
        console.error("Error in background script:", error);
      }
    } else if (changeInfo.status === "loading") {
      console.log("YouTube page is loading...");
    }
  }
});

// This function runs in the context of the web page
function applySpeedForChannel(channelSpeeds: ChannelSpeed[]) {
  console.log("Running applySpeedForChannel with data:", channelSpeeds);
    // Helper function to detect channel name using multiple methods
  function getChannelName() {
    // Method 1: Using DOM selectors (most common approach)
    const selectors = [
      'ytd-channel-name a',
      '#top-row ytd-channel-name a',
      '#owner-text a',
      '.ytd-video-owner-renderer .ytd-channel-name',
      'span[itemprop="author"] [itemprop="name"]',
      '#channel-name',
      '#meta-contents #channel-name .ytd-channel-name',
      'ytd-video-owner-renderer .ytd-channel-name a',
      '#above-the-fold #text.ytd-channel-name',
      'yt-formatted-string.ytd-channel-name'
    ];
    
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        if (element && element.textContent) {
          const name = element.textContent.trim();
          if (name) return name;
        }
      }
    }

    // Method 2: Using YouTube's structured data
    try {
      const ldJson = document.querySelector('script[type="application/ld+json"]');
      if (ldJson && ldJson.textContent) {
        const data = JSON.parse(ldJson.textContent);
        if (data && data.author && data.author.name) {
          return data.author.name;
        }
      }
    } catch (e) {
      console.log("Error parsing structured data:", e);
    }

    // Method 3: Using the page URL (fallback)
    const channelUrl = window.location.href.match(/youtube\.com\/(c|channel|user)\/([^\/\?]+)/);
    if (channelUrl && channelUrl[2]) {
      return decodeURIComponent(channelUrl[2]);
    }
    
    // Method 4: Looking at video description metadata
    const metaAuthor = document.querySelector('meta[name="author"]');
    if (metaAuthor && metaAuthor.getAttribute('content')) {
      return metaAuthor.getAttribute('content');
    }

    console.log("Failed to detect channel name with any method");
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
