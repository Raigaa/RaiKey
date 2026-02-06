const DEFAULT_SETTINGS = {
  version: '1.0.0',
  shortcuts: {
    'detach-tab': 'detach-tab'
  },
  customShortcuts: {
  }
};
async function loadSettings() {
  try {
    const result = await browser.storage.sync.get('settings');
    
    if (result.settings) {
      return {
        ...DEFAULT_SETTINGS,
        ...result.settings,
        shortcuts: {
          ...DEFAULT_SETTINGS.shortcuts,
          ...(result.settings.shortcuts || {})
        },
        customShortcuts: {
          ...DEFAULT_SETTINGS.customShortcuts,
          ...(result.settings.customShortcuts || {})
        }
      };
    }
    
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('[RaiKey] Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
}

async function saveSettings(settings) {
  try {
    if (!validateSettings(settings)) {
      throw new Error('Invalid settings format');
    }
    
    await browser.storage.sync.set({ settings });
    console.log('[RaiKey] Settings saved successfully');
    return true;
  } catch (error) {
    console.error('[RaiKey] Error saving settings:', error);
    throw error;
  }
}

function validateSettings(settings) {
  if (!settings || typeof settings !== 'object') {
    return false;
  }
  
  if (!settings.shortcuts || typeof settings.shortcuts !== 'object') {
    return false;
  }
  
  if (!settings.customShortcuts || typeof settings.customShortcuts !== 'object') {
    return false;
  }
  
  return true;
}

async function resetSettings() {
  await saveSettings(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}

function getDefaultSettings() {
  return { ...DEFAULT_SETTINGS };
}
