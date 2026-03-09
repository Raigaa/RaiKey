async function detachTab() {
  try {
    const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
    
    if (tabs.length === 0) {
      throw new Error('No active tab found');
    }
    
    const currentTab = tabs[0];
    
    const allTabsInWindow = await browser.tabs.query({ windowId: currentTab.windowId });
    
    if (allTabsInWindow.length === 1) {
      console.log('[RaiKey] Cannot detach the last tab in a window');
      notifyError('Cannot detach the last tab in a window');
      return;
    }
    
    const tabPinned = currentTab.pinned;
    
    const newWindow = await browser.windows.create({
      tabId: currentTab.id,
      focused: true
    });
    
    if (tabPinned) {
      const newCtxTabs = await browser.tabs.query({ windowId: newWindow.id });
      if (newCtxTabs.length > 0) {
        await browser.tabs.update(newCtxTabs[0].id, { pinned: true });
      }
    }
    
    console.log(`[RaiKey] Tab detached successfully: ${currentTab.id}`);
    
  } catch (error) {
    console.error('[RaiKey] Error detaching tab:', error);
    throw error;
  }
}

async function duplicateTab() {
  try {
    const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
    
    if (tabs.length === 0) {
      throw new Error('No active tab found');
    }
    
    const currentTab = tabs[0];
    await browser.tabs.duplicate(currentTab.id);
    
    console.log(`[RaiKey] Tab duplicated successfully: ${currentTab.id}`);
    
  } catch (error) {
    console.error('[RaiKey] Error duplicating tab:', error);
    notifyError('Error duplicating tab');
    throw error;
  }
}

const DEFAULT_SETTINGS = {
  version: '1.0.0',
  shortcuts: {
    'detach-tab': 'detach-tab',
    'duplicate-tab': 'duplicate-tab'
  },
  customShortcuts: {}
};

async function loadSettings() {
  try {
    const result = await browser.storage.sync.get('settings');
    if (result.settings) {
      return {
        ...DEFAULT_SETTINGS,
        ...result.settings,
        shortcuts: { ...DEFAULT_SETTINGS.shortcuts, ...(result.settings.shortcuts || {}) }
      };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('[RaiKey] Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
}

const ACTION_REGISTRY = {
  'detach-tab': detachTab,
  'duplicate-tab': duplicateTab
};

async function executeAction(actionId) {
  const action = ACTION_REGISTRY[actionId];
  if (!action) {
    throw new Error(`Unknown action: ${actionId}`);
  }
  await action();
}

function notifyError(message) {
  browser.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon-48.png',
    title: 'RaiKey',
    message: message
  });
}

browser.commands.onCommand.addListener(async (command) => {
  console.log(`[RaiKey] Command received: ${command}`);
  try {
    await executeAction(command);
  } catch (error) {
    console.error(`[RaiKey] Error executing command ${command}:`, error);
    notifyError(`Error: ${error.message}`);
  }
});

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'executeAction') {
    console.log(`[RaiKey] Received manual execution request for: ${message.actionId}`);
    executeAction(message.actionId)
      .then(() => sendResponse({ success: true }))
      .catch((err) => {
        console.error('[RaiKey] Action failed:', err);
        sendResponse({ success: false, error: err.message });
      });
    return true;
  }
  
  if (message.type === 'getAvailableActions') {
    const actions = Object.keys(ACTION_REGISTRY).map(id => {
      let name = id;
      let description = '';
      if (id === 'detach-tab') {
        name = 'Detach Tab';
        description = 'Sends the current tab to a new window';
      } else if (id === 'duplicate-tab') {
        name = 'Duplicate Tab';
        description = 'Duplicates the current active tab';
      }
      return { id, name, description };
    });
    sendResponse({ actions });
    return false;
  }
});

console.log('[RaiKey] Background script fully loaded and ready');
