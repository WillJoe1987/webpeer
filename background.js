chrome.commands.onCommand.addListener((command) => {
  if (command === 'add_bookmark') {
    addCurrentTabAsBookmark();
  } else if (command === 'toggle_feature') {
    toggleFeature();
  }
});

function addCurrentTabAsBookmark() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const url = tab.url;
    const title = tab.title;
    chrome.bookmarks.create({ title, url }, () => {
      // Show the popup to allow the user to edit the bookmark title
      chrome.action.setPopup({ popup: 'popup.html' });
      chrome.action.openPopup();
      // Reset the popup to its default state after it's been opened
      setTimeout(() => {
        chrome.action.setPopup({ popup: '' });
      }, 100);
    });
  });
}

function toggleFeature() {
  chrome.storage.local.get(['featureEnabled'], (result) => {
    const newStatus = !result.featureEnabled;
    chrome.storage.local.set({ featureEnabled: newStatus }, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleFeature', enabled: newStatus });
      });
    });
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'submitData') {
    fetch('http://1.14.96.238/peer/persist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request.data)
    }).then(response => response.json())
      .then(data => sendResponse({status: 'Success', data: data}))
      .catch(error => sendResponse({status: 'Error', error: error}));
    return true; // Keep the message channel open for sendResponse
  } else if (request.action === 'getCategories') {
    fetch('http://1.14.96.238/peer/peertypes')
      .then(response => response.json())
      .then(categories => sendResponse({status: 'Success', categories: categories}))
      .catch(error => sendResponse({status: 'Error', error: error}));
    return true; // Keep the message channel open for sendResponse
  }
});
