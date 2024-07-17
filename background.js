let screenshotData = null;
let currentTabId = null;
let currentWindowId = null;
let tabScreenshots = {};
let screenshotInterval = null;

function captureScreenshot(currenttab) {
  
    chrome.storage.local.set({ onActivatedExecuted: "onActive executed" });
   
    setTimeout(() => {
      chrome.tabs.captureVisibleTab(null, {format: 'png'}, function(image) {
        const screenshotData = image;
        chrome.storage.local.set({ screenshotData: image, executed: "Executed" });
       // console.log("Screenshot capture"); // Keep this for debugging
        if (image) {
            
            console.log("captureScreenshot for current tab " );
            if (!tabScreenshots[currenttab]) {
                tabScreenshots[currenttab] = image;
                chrome.storage.local.set({tabScreenshots: tabScreenshots});
                console.log("Screenshot added for tab ID:", currenttab);
            }
          //  console.log(compareScreenshotForTabnapping(currenttab, image));
        } else {
            console.log("Failed to capture screenshot for current tab ");
        }
      });   
    }, 500); // Delay of 1 second
  }
  
chrome.tabs.onActivated.addListener(activeInfo => {
    chrome.runtime.sendMessage({ action: 'clearBadge' }); 
    captureScreenshot(activeInfo.tabId);
    //console.log("into function"); 
    chrome.storage.local.set({ currentTabId: activeInfo.tabId });
    console.log("Current tab ID set to", activeInfo.tabId);
    if (screenshotInterval) {
        clearInterval(screenshotInterval);
        console.log('Interval cleared');
    }
  
    screenshotInterval = setInterval(captureAndStoreScreenshot,10000);
 
    
  });
  
function captureAndStoreScreenshot() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs.length === 0 || chrome.runtime.lastError) {
            console.error('Error capturing screenshot:', chrome.runtime.lastError?.message);
            return;
        }

        let activeTab = tabs[0];
        chrome.tabs.captureVisibleTab(activeTab.windowId, {format: 'png'}, function(image) {
            if (chrome.runtime.lastError) {
                console.error('Error capturing screenshot:', chrome.runtime.lastError.message);
                return;
            }

            if (image) {
                console.log("captureAndStoreScreenshot for tab " + activeTab.id);
                tabScreenshots[activeTab.id] = image;
                chrome.storage.local.set({tabScreenshots: tabScreenshots});
            } else {
                console.log("Failed to capture screenshot for tab " + activeTab.id);
            }
        });
    });
}
// Listen for messages from other scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'setBadge') {
        // Set the badge text
        chrome.action.setBadgeText({ text: request.text });
        chrome.action.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
    } else if (request.action === 'clearBadge') {
        // Clear the badge text
        console.log('clearbadge');
        chrome.action.setBadgeText({ text: '' });
    }
});
chrome.action.onClicked.addListener((tab) => {
    // Send a message to clear the badge when the extension icon is clicked
    console.log('click button');
    chrome.runtime.sendMessage({ action: 'clearBadge' });
});