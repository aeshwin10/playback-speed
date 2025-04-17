// content.ts
// Main script that injects the React overlay into YouTube video pages

// Inject the built overlay.js bundle into the YouTube video page
function injectReactApp() {
  let appContainer = document.getElementById('react-overlay-root');
  if (!appContainer) {
    appContainer = document.createElement('div');
    appContainer.id = 'react-overlay-root';
    document.body.appendChild(appContainer);
  }

  // Prevent duplicate injection
  if (document.getElementById('react-overlay-script')) return;

  const script = document.createElement('script');
  script.id = 'react-overlay-script';
  script.src = chrome.runtime.getURL('overlay.js');
  script.type = 'module';
  document.body.appendChild(script);
}

// Check if the current page is a YouTube video page
function isYouTubeVideoPage() {
  return window.location.hostname === 'www.youtube.com' && window.location.pathname === '/watch';
}

// Observe changes to the DOM to detect navigation to a YouTube video page
function observeDOMChanges() {
  const observer = new MutationObserver(() => {
    if (isYouTubeVideoPage() && !document.getElementById('react-overlay-root')) {
      injectReactApp();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Initialize the content script
function initializeContentScript() {
  if (isYouTubeVideoPage()) {
    injectReactApp();
  }
  observeDOMChanges();
}

initializeContentScript();