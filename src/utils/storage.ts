// storage.ts
// Wrapper for chrome.storage

export const getFromStorage = <T>(key: string): Promise<T | undefined> => {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key]);
    });
  });
};

export const setInStorage = (key: string, value: any): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, () => {
      resolve();
    });
  });
};

export const removeFromStorage = (key: string): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.remove([key], () => {
      resolve();
    });
  });
};
