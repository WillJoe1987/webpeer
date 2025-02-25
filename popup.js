document.addEventListener('DOMContentLoaded', () => {
    // 获取开关按钮的状态并初始化
    const featureToggle = document.getElementById('feature-toggle');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getFeatureStatus' }, (response) => {
            featureToggle.checked = response.enabled;
        });
    });

    // 监听开关按钮的状态变化
    featureToggle.addEventListener('change', () => {
        const isEnabled = featureToggle.checked;
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleFeature', enabled: isEnabled }, (response) => {
                console.log(response.status);
            });
        });
    });
});
