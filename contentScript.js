let isFeatureEnabled = false;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action === "getPageContent") {
            sendResponse({content: document.documentElement.innerHTML});
        } else if (request.action === "toggleFeature") {
            isFeatureEnabled = request.enabled;
            sendResponse({status: "Feature toggled", enabled: isFeatureEnabled});
        } else if (request.action === "getFeatureStatus") {
            sendResponse({enabled: isFeatureEnabled});
        }
    }
);

document.addEventListener('mouseover', function(event) {
    if (isFeatureEnabled) {
        event.target.style.outline = '2px solid red';
    }
});

document.addEventListener('mouseout', function(event) {
    if (isFeatureEnabled) {
        event.target.style.outline = '';
    }
});

document.addEventListener('click', function(event) {
    if (isFeatureEnabled) {
        const selectedDom = event.target.outerHTML;
        const currentUrl = window.location.href;
        const data = {
            peer: selectedDom,
            domain: currentUrl
        };

        chrome.runtime.sendMessage({action: 'submitData', data: data}, (response) => {
            if (response.status === 'Success') {
                console.log('Success:', response.data);
            } else {
                console.error('Error:', response.error);
            }
        });
    }
}, true);


