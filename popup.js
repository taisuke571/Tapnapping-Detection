document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get(['screenshotData', 'executed', 'onActivatedExecuted', 'tabScreenshots','currentTabId'], function(result) {
      console.log('popup.js')
     // if (result.onActivatedExecuted) {
     //   document.getElementById('status').textContent = result.onActivatedExecuted;
     // }
     
      if (result.currentTabId) {
        document.getElementById('currentTabId').textContent = 'Current Tab ID: ' + result.currentTabId;
    } else {
        document.getElementById('currentTabId').textContent = 'Current Tab ID not available';
    }
      if (result.screenshotData) {
        document.getElementById('screenshot').src = result.screenshotData;
       // document.getElementById('executedStatus').textContent = result.executed; // Display the executed message
      } else {
        document.getElementById('screenshot').alt = "No screenshot available";
      }
      if (result.currentTabId && result.screenshotData && result.tabScreenshots) {
        const currentTabScreenshot = result.tabScreenshots[result.currentTabId];
        if (currentTabScreenshot) {
            if (typeof resemble === 'function') {
                console.log('resemble function exists');
                // You can safely use the resemble function here
            } else {
                console.log('resemble function does not exist');
                // The resemble function is not available
            }
          
          
           resemble(currentTabScreenshot).compareTo(result.screenshotData).onComplete(function(data) {
                console.log("Comparison result for current tab:", data);
                let percent = data.misMatchPercentage;
                
                console.log('result', percent)
                if (parseFloat(percent) > 0.00) {
                    // Send a message to the background script to set the badge text
                    chrome.runtime.sendMessage({ action: 'setBadge', text: 'TabNapping!!!' });
                    document.getElementById('percentDifference').textContent = 'Tabnapping!! Percentage difference: ' + percent + '%';
    
                
                    
                }
                else{chrome.runtime.sendMessage({ action: 'clearBadge' });}
                
            });
        }
    }
      if (result.tabScreenshots) {
        console.log(result.tabScreenshots);
        const allTabsContainer = document.getElementById('allTabsScreenshots');
        allTabsContainer.innerHTML = ''; // Clear existing content

        Object.keys(result.tabScreenshots).forEach(tabId => {
            const screenshot = result.tabScreenshots[tabId];

            // Create elements for displaying each screenshot
            const screenshotElem = document.createElement('img');
            const idElem = document.createElement('p');

            // Set content for elements
            idElem.textContent = `Tab ID: ${tabId}`;
            screenshotElem.src = screenshot;
            screenshotElem.alt = `Screenshot of Tab ${tabId}`;

            // Append elements to the container
            allTabsContainer.appendChild(idElem);
            allTabsContainer.appendChild(screenshotElem);
        });
    }else { console.log('tabscreenshot not working');}
    });
  });
  