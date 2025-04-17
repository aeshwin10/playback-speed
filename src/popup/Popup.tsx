import React, { useEffect, useState } from "react";
import { getFromStorage, setInStorage } from "../utils/storage";
import { calculateTimeSaved } from "../utils/timeSaver";

interface ChannelSpeed {
  channelName: string;
  speed: number;
  watchTime: number; // in seconds
}

const Popup: React.FC = () => {
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState<number>(1);
  const [savedChannels, setSavedChannels] = useState<ChannelSpeed[]>([]);
  const [totalTimeSaved, setTotalTimeSaved] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Speed presets
  const speedOptions = [1, 1.25, 1.5, 1.75, 2, 2.5, 3];

  useEffect(() => {
    // Get the current tab to check if it's YouTube
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];
      if (!tab.url?.includes("youtube.com/watch")) {
        setIsLoading(false);
        return;
      }

      // Get channel name from the current tab
      try {        const [result] = await chrome.scripting.executeScript({
          target: { tabId: tab.id! },
          func: () => {
            const channelLink = document.querySelector('ytd-channel-name a');
            return channelLink?.textContent?.trim() || null;
          }        });
        
        // Ensure we only pass string or null, never undefined
        const channelName = typeof result.result === 'string' ? result.result : null;
        setCurrentChannel(channelName);
        
        // Get saved channel data
        const savedData = await getFromStorage<ChannelSpeed[]>("channelSpeeds") || [];
        setSavedChannels(savedData);
        
        // Get current speed setting for this channel
        const channelData = savedData.find(c => c.channelName === result.result);
        if (channelData) {
          setCurrentSpeed(channelData.speed);
          
          // Apply the saved speed to the current video
          await chrome.scripting.executeScript({
            target: { tabId: tab.id! },
            func: (speed) => {
              const video = document.querySelector('video');
              if (video) video.playbackRate = speed;
            },
            args: [channelData.speed]
          });
        }
        
        // Calculate total time saved
        const totalSaved = savedData.reduce((total, channel) => {
          return total + calculateTimeSaved(channel.speed, channel.watchTime);
        }, 0);
        
        setTotalTimeSaved(totalSaved);
        setIsLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setIsLoading(false);
      }
    });
  }, []);
  const handleSpeedChange = async (speed: number) => {
    if (!currentChannel) return;
    
    setCurrentSpeed(speed);
    
    // Update the current video's playback speed
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];
      if (tab.id) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (newSpeed) => {
            const video = document.querySelector('video');
            if (video) video.playbackRate = newSpeed;
          },
          args: [speed]
        });
      }
    });
    
    // Save the new speed setting for this channel
    const updatedChannels = [...savedChannels];
    const existingChannel = updatedChannels.find(c => c.channelName === currentChannel);
    
    if (existingChannel) {
      existingChannel.speed = speed;
      // Make sure watchTime exists
      if (typeof existingChannel.watchTime !== 'number') {
        existingChannel.watchTime = 0;
      }
    } else {
      updatedChannels.push({
        channelName: currentChannel,
        speed: speed,
        watchTime: 0
      });
    }
    
    setSavedChannels(updatedChannels);
    await setInStorage("channelSpeeds", updatedChannels);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return [
      hours > 0 ? `${hours}h` : '',
      minutes > 0 ? `${minutes}m` : '',
      `${secs}s`
    ].filter(Boolean).join(' ');
  };

  if (isLoading) {
    return (
      <div className="p-4 w-80 h-64 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 w-80">
      <h2 className="text-lg font-bold mb-2">Playback Speed Manager</h2>
      
      {!currentChannel ? (
        <div className="text-gray-600 mb-4">
          Please open a YouTube video to control playback speed.
        </div>
      ) : (
        <>
          <div className="mb-3">
            <div className="font-medium">Current channel:</div>
            <div className="text-gray-700">{currentChannel}</div>
          </div>
          
          <div className="mb-3">
            <div className="font-medium mb-1">Playback speed:</div>
            <div className="flex flex-wrap gap-2">
              {speedOptions.map(speed => (
                <button
                  key={speed}
                  className={`py-1 px-2 rounded text-sm ${
                    currentSpeed === speed 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  onClick={() => handleSpeedChange(speed)}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      
      <div className="border-t pt-3 mt-3">
        <div className="font-medium mb-1">Time saved watching videos:</div>
        <div className="text-green-600 font-bold">
          {formatTime(totalTimeSaved)}
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        Your preferences are automatically saved per channel.
      </div>
    </div>
  );
};

export default Popup;
