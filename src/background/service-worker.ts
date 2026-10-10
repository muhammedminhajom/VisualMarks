import { BookmarkInput } from '../types/bookmark';
import { saveBookmark, getBookmarkByUrl } from '../services/bookmarkStorage';
import { getFaviconUrl } from '../utils/url';

function showBadge(text: string, color: string) {
  try {
    chrome.action.setBadgeText({ text });
    chrome.action.setBadgeBackgroundColor({ color });
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '' });
    }, 2000);
  } catch (err) {
    console.error('Failed to set badge:', err);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'save-to-visualmarks',
    title: 'Save to VisualMarks',
    contexts: ['page', 'link', 'image'],
  });

  chrome.contextMenus.create({
    id: 'save-link-to-visualmarks',
    title: 'Save Link to VisualMarks',
    contexts: ['link'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id || !tab.url) return;

  let url = info.linkUrl || tab.url;
  let title = info.selectionText || tab.title || '';

  try {
    if (info.menuItemId === 'save-link-to-visualmarks' && info.linkUrl) {
      url = info.linkUrl;
      try {
        const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
        title = response.url || url;
      } catch {
        title = url;
      }
    }

    const existing = await getBookmarkByUrl(url);
    if (existing) {
      showBadge('!', '#f59e0b');
      return;
    }

    let domain = '';
    try {
      domain = new URL(url).hostname;
    } catch {
      domain = 'web';
    }

    const bookmarkInput: BookmarkInput = {
      title: title || domain,
      url,
      domain: domain.replace(/^www\./, ''),
      favicon: getFaviconUrl(domain),
      tags: [],
      favorite: false,
    };

    await saveBookmark(bookmarkInput);
    showBadge('✓', '#10b981');
  } catch (error) {
    console.error('Failed to save bookmark:', error);
    showBadge('✕', '#ef4444');
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'save-bookmark') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url && tab?.title) {
      try {
        const existing = await getBookmarkByUrl(tab.url);
        if (existing) {
          showBadge('!', '#f59e0b');
          return;
        }

        let domain = '';
        try {
          domain = new URL(tab.url).hostname;
        } catch {
          domain = 'web';
        }

        await saveBookmark({
          title: tab.title,
          url: tab.url,
          domain: domain.replace(/^www\./, ''),
          favicon: tab.favIconUrl || getFaviconUrl(domain),
          tags: [],
          favorite: false,
        });

        showBadge('✓', '#10b981');
      } catch (err) {
        console.error('Failed to save bookmark from shortcut:', err);
        showBadge('✕', '#ef4444');
      }
    }
  }

  if (command === 'open-dashboard') {
    chrome.tabs.create({ url: 'dashboard.html' });
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_CURRENT_TAB') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      sendResponse({ tab: tabs[0] });
    });
    return true;
  }
});