let extractedContent = {};

chrome.runtime.onInstalled.addListener(() => {
  console.log('插件已安装');
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.url.startsWith('https://blog.csdn.net/')) {
    chrome.tabs.sendMessage(tab.id, { action: 'showOverlay' });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'saveContent') {
    extractedContent[message.url] = message.content;
    sendResponse({success: true});
  } else if (message.action === 'getContent') {
    sendResponse({content: extractedContent[message.url]});
  }
  return true; // 保持消息通道开放
});