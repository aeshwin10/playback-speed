// youtube.ts
// Utilities for extracting YouTube channel info and manipulating playback

export function getChannelName(): string | null {
  // Method 1: Try the standard channel name link
  const channelLink = document.querySelector('ytd-channel-name a');
  if (channelLink && channelLink.textContent) {
    return channelLink.textContent.trim() || null;
  }
  
  // Method 2: Try the channel name in video description
  const channelNameElement = document.querySelector('#top-row ytd-channel-name');
  if (channelNameElement && channelNameElement.textContent) {
    return channelNameElement.textContent.trim() || null;
  }
  
  // Method 3: Try the owner text in the video info
  const ownerText = document.querySelector('#owner-text a');
  if (ownerText && ownerText.textContent) {
    return ownerText.textContent.trim() || null;
  }
  
  // Method 4: Try the author name in video details
  const authorName = document.querySelector('.ytd-video-owner-renderer .ytd-channel-name');
  if (authorName && authorName.textContent) {
    return authorName.textContent.trim() || null;
  }
  
  // Method 5: Try to get from microdata
  const microdata = document.querySelector('span[itemprop="author"] [itemprop="name"]');
  if (microdata && microdata.textContent) {
    return microdata.textContent.trim() || null;
  }
  
  // Method 6: Try to extract from URL if we're on a channel page
  if (window.location.pathname.includes('/channel/') || window.location.pathname.includes('/c/') || window.location.pathname.includes('/user/')) {
    const pathParts = window.location.pathname.split('/');
    // Get the last non-empty part of the path
    for (let i = pathParts.length - 1; i >= 0; i--) {
      if (pathParts[i]) return decodeURIComponent(pathParts[i]);
    }
  }
  
  // If all else fails, try to get any text that might identify the channel
  const anyChannelText = document.querySelector('#channel-name, #channel-header yt-formatted-string');
  if (anyChannelText && anyChannelText.textContent) {
    return anyChannelText.textContent.trim() || null;
  }
  
  // No channel name found with any method
  return null;
}

export function getVideoElement(): HTMLVideoElement | null {
  return document.querySelector('video');
}

export function setPlaybackRate(rate: number) {
  const video = getVideoElement();
  if (video) video.playbackRate = rate;
}

export function getPlaybackRate(): number {
  const video = getVideoElement();
  return video ? video.playbackRate : 1.0;
}
