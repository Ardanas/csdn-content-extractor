chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'showOverlay') {
    const overlay = document.createElement('div');
    overlay.id = 'csdn-extractor-container';
    document.body.appendChild(overlay);

    fetch(chrome.runtime.getURL('overlay.html'))
      .then(response => response.text())
      .then(data => {
        overlay.innerHTML = data;
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('overlay.js');
        document.body.appendChild(script);
      });
  }
});

// 监听来自overlay.js的消息
window.addEventListener("message", (event) => {
  if (event.data.type && event.data.type === "FROM_PAGE") {
    if (event.data.action === "getContent") {
      chrome.runtime.sendMessage({ action: 'getContent', url: event.data.url }, response => {
        if (response && response.content) {
          window.postMessage({ type: "FROM_CONTENT", action: "showContent", content: response.content }, "*");
        } else {
          window.postMessage({ type: "FROM_CONTENT", action: "extractContent" }, "*");
        }
      });
    } else if (event.data.action === "saveContent") {
      chrome.runtime.sendMessage({ action: 'saveContent', content: event.data.content, url: event.data.url }, () => {
        window.postMessage({ type: "FROM_CONTENT", action: "showContent", content: event.data.content }, "*");
      });
    }
  }
}, false);

document.addEventListener('copy', function(e) {
  e.stopPropagation();
}, true);

document.body.oncopy = null;
document.body.style.userSelect = 'auto';