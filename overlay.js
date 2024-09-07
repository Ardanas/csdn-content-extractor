let isLoading = false;
let isDragging = false;
let startX, startY, startLeft, startTop;

function initOverlay() {
  window.postMessage({ type: "FROM_PAGE", action: 'getContent', url: window.location.href }, "*");

  // 添加拖动功能
  const overlay = document.getElementById('csdn-extractor-overlay');
  const header = document.getElementById('csdn-extractor-header');

  header.addEventListener('mousedown', startDragging);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', stopDragging);
}

function startDragging(e) {
  isDragging = true;
  startX = e.clientX;
  startY = e.clientY;
  const overlay = document.getElementById('csdn-extractor-overlay');
  startLeft = parseInt(window.getComputedStyle(overlay).left);
  startTop = parseInt(window.getComputedStyle(overlay).top);
}

function drag(e) {
  if (!isDragging) return;
  e.preventDefault();
  const overlay = document.getElementById('csdn-extractor-overlay');
  const newLeft = startLeft + e.clientX - startX;
  const newTop = startTop + e.clientY - startY;
  overlay.style.left = `${newLeft}px`;
  overlay.style.top = `${newTop}px`;
}

function stopDragging() {
  isDragging = false;
}

function showLoading() {
  isLoading = true;
  const contentDiv = document.getElementById('csdn-extractor-content');
  contentDiv.innerHTML = '<p>正在提取内容，请稍候...</p>';

  setTimeout(() => {
    if (isLoading) {
      contentDiv.innerHTML += '<p>提取时间较长，请耐心等待...</p>';
    }
  }, 1000);
}

function extractContent() {
  showLoading();
  const article = document.querySelector('article');
  if (article) {
    const content = article.innerHTML;
    window.postMessage({ type: "FROM_PAGE", action: 'saveContent', content: content, url: window.location.href }, "*");
  } else {
    showError();
  }
}

function showContent(content) {
  isLoading = false;
  const contentDiv = document.getElementById('csdn-extractor-content');

  // 创建一个临时的div元素来解析HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;

  // 处理代码块
  tempDiv.querySelectorAll('pre, code').forEach(el => {
    const codeContent = el.textContent || el.innerText;
    const newPre = document.createElement('pre');
    newPre.textContent = codeContent;
    newPre.style.whiteSpace = 'pre-wrap';
    newPre.style.wordBreak = 'break-word';
    newPre.style.backgroundColor = '#f6f8fa';
    newPre.style.padding = '10px';
    newPre.style.borderRadius = '4px';
    newPre.style.fontSize = '14px';
    newPre.style.lineHeight = '1.5';
    newPre.style.fontFamily = 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace';
    newPre.style.userSelect = 'text';  // 确保代码可以被选中
    newPre.style.webkitUserSelect = 'text';  // 为 WebKit 浏览器添加
    el.parentNode.replaceChild(newPre, el);
  });

  // 移除不需要的元素
  tempDiv.querySelectorAll('script, style, iframe').forEach(el => el.remove());

  // 将处理后的内容设置到contentDiv
  contentDiv.innerHTML = tempDiv.innerHTML;

  // 允许选择文本
  contentDiv.style.userSelect = 'text';
  contentDiv.style.webkitUserSelect = 'text';

  // 为所有代码块添加复制按钮
  contentDiv.querySelectorAll('pre').forEach(el => {
    const copyButton = document.createElement('button');
    copyButton.textContent = '复制代码';
    copyButton.style.position = 'absolute';
    copyButton.style.right = '10px';
    copyButton.style.top = '5px';
    copyButton.style.padding = '3px 8px';
    copyButton.style.fontSize = '12px';
    copyButton.style.backgroundColor = '#e1e4e8';
    copyButton.style.border = 'none';
    copyButton.style.borderRadius = '3px';
    copyButton.style.cursor = 'pointer';

    copyButton.addEventListener('click', function(e) {
      e.stopPropagation();
      const codeText = this.parentNode.textContent.replace('复制代码', '').trim();
      navigator.clipboard.writeText(codeText).then(() => {
        this.textContent = '已复制';
        setTimeout(() => {
          this.textContent = '复制代码';
        }, 2000);
      }).catch(err => {
        console.error('复制失败', err);
      });
    });

    el.style.position = 'relative';
    el.insertBefore(copyButton, el.firstChild);
  });
}

function showError() {
  isLoading = false;
  const contentDiv = document.getElementById('csdn-extractor-content');
  contentDiv.innerHTML = '<p>提取内容失败，请刷���页面后重试。</p>';
}

// 关闭按钮功能
document.getElementById('csdn-extractor-close').addEventListener('click', () => {
  document.getElementById('csdn-extractor-overlay').remove();
});

// 监听来自content.js的消息
window.addEventListener("message", (event) => {
  if (event.data.type && event.data.type === "FROM_CONTENT") {
    if (event.data.action === "showContent") {
      showContent(event.data.content);
    } else if (event.data.action === "extractContent") {
      extractContent();
    }
  }
}, false);

// 初始化悬浮窗
initOverlay();