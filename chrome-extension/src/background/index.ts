import 'webextension-polyfill';
import { exampleThemeStorage } from '@extension/storage';

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

console.log('Background loaded');
console.log("Edit 'chrome-extension/src/background/index.ts' and save to reload.");

// Enable Side Panel on extension icon click
chrome.action.onClicked.addListener(async tab => {
  if (tab.id) {
    try {
      await chrome.sidePanel.open({ tabId: tab.id });
      console.log('Side panel opened for tab:', tab.id);
    } catch (error) {
      console.error('Failed to open side panel:', error);
    }
  }
});

// Set side panel behavior to open on action click
chrome.runtime.onInstalled.addListener(() => {
  console.log('QuickBridge extension installed');
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(error => {
    console.error('Failed to set panel behavior:', error);
  });
});
