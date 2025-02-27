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
        isFeatureEnabled = false;
        const selectedDom = event.target.outerHTML;
        const currentUrl = window.location.href;

        // 通过消息传递获取类别信息
        chrome.runtime.sendMessage({action: 'getCategories'}, (response) => {
            if (response.status === 'Success') {
                const categories = response.categories;

                // 创建可编辑的下拉框
                const select = document.createElement('select');
                const inputOption = document.createElement('option');
                inputOption.value = '';
                inputOption.textContent = '或输入一个类别';
                select.appendChild(inputOption);

                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category;
                    option.textContent = category;
                    select.appendChild(option);
                });

                // 创建自定义对话框
                const dialog = document.createElement('div');
                dialog.style.position = 'fixed';
                dialog.style.top = '50%';
                dialog.style.left = '50%';
                dialog.style.transform = 'translate(-50%, -50%)';
                dialog.style.backgroundColor = 'white';
                dialog.style.padding = '20px';
                dialog.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
                dialog.appendChild(select);

                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = '或输入一个类别';
                dialog.appendChild(input);

                const button = document.createElement('button');
                button.textContent = '确定';
                button.onclick = function() {
                    const category = input.value || select.options[select.selectedIndex].value;
                    if (category) {
                        const data = {
                            peer: selectedDom,
                            domain: currentUrl,
                            peertype: category
                        };

                        chrome.runtime.sendMessage({action: 'submitData', data: data}, (response) => {
                            isFeatureEnabled = true;
                            if (response.status === 'Success') {
                                console.log('Success:', response.data);
                            } else {
                                console.error('Error:', response.error);
                            }
                        });
                    }
                    document.body.removeChild(dialog);
                };
                dialog.appendChild(button);
                const buttoncancel = document.createElement('button');
                buttoncancel.textContent = '取消';
                buttoncancel.onclick = function() {
                    document.body.removeChild(dialog);
                    isFeatureEnabled = true;
                };
                dialog.appendChild(buttoncancel);

                document.body.appendChild(dialog);
            } else {
                isFeatureEnabled = true;
                console.error('Error fetching categories:', response.error);
            }
        });
    }
}, true);


