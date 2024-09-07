let isLoading = false;

function initPopup() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab.url.startsWith('https://blog.csdn.net/')) {
      showLoading();
      chrome.runtime.sendMessage({ action: 'getContent', url: tab.url }, response => {
        if (response && response.content) {
          showContent(response.content);
        } else {
          extractContentFromPage(tab.id, tab.url);
        }
      });
    } else {
      showNotSupportedMessage();
    }
  });
}

function showLoading() {
  isLoading = true;
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = '<p>正在提取内容，请稍候...</p>';

  setTimeout(() => {
    if (isLoading) {
      contentDiv.innerHTML += '<p>提取时间较长，请耐心等待...</p>';
    }
  }, 1000);
}

function extractContentFromPage(tabId, url) {
  chrome.tabs.sendMessage(tabId, { action: 'extractContent' }, response => {
    if (response && response.content) {
      chrome.runtime.sendMessage({ action: 'saveContent', content: response.content, url: url }, () => {
        showContent(response.content);
      });
    } else {
      showError();
    }
  });
}

function showContent(content) {
  isLoading = false;
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = content;

  // 移除不需要的元素
  contentDiv.querySelectorAll('script, style, iframe').forEach(el => el.remove());

  // 移除所有事件监听器
  const elements = contentDiv.getElementsByTagName("*");
  for (let i = 0; i < elements.length; i++) {
    elements[i].outerHTML = elements[i].outerHTML;
  }

  // 允许选择文本
  contentDiv.style.userSelect = 'text';
  contentDiv.style.webkitUserSelect = 'text';
}

function showNotSupportedMessage() {
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = '<p>此插件仅支持CSDN博客页面。</p>';
}

function showError() {
  isLoading = false;
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = '<p>提取内容失败，请刷新页面后重试。</p>';
}

// 实现可调节宽度
let isResizing = false;
const resizer = document.getElementById('resizer');
const body = document.body;

resizer.addEventListener('mousedown', (e) => {
  isResizing = true;
  document.addEventListener('mousemove', resize);
  document.addEventListener('mouseup', stopResize);
});

function resize(e) {
  if (isResizing) {
    const width = document.documentElement.clientWidth - e.clientX;
    body.style.width = `${width}px`;
  }
}

function stopResize() {
  isResizing = false;
  document.removeEventListener('mousemove', resize);
}

// 关闭按钮功能
document.getElementById('close').addEventListener('click', () => {
  window.close();
});

// 初始化弹窗
initPopup();