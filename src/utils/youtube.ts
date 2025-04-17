// youtube.ts
// Utilities for extracting YouTube channel info and manipulating playback

export function getChannelName(): string | null {
  // Try to get channel name from YouTube DOM
  const meta = document.querySelector('meta[itemprop="channelId"]');
  if (meta) {
    const channelLink = document.querySelector('ytd-channel-name a');
    if (channelLink) return channelLink.textContent?.trim() || null;
  }
  // Fallback: Try to get from other selectors if needed
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
