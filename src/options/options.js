let currentSettings = null;
let availableActions = [];

const shortcutsList = document.getElementById('shortcuts-list');
const saveBtn = document.getElementById('save-btn');
const resetBtn = document.getElementById('reset-btn');
const statusMessage = document.getElementById('status-message');

async function init() {
  try {
    currentSettings = await loadSettings();
    const commands = await browser.commands.getAll(); 
    availableActions = commands.map(cmd => ({
      id: cmd.name,
      name: getActionDisplayName(cmd.name),
      description: cmd.description,
      defaultShortcut: cmd.shortcut
    }));
    
    renderShortcutsList();    
  } catch (error) {
    console.error('[RaiKey Options] Initialization error:', error);
    showStatus('Error loading settings', 'error');
  }
}

function renderShortcutsList() {
  shortcutsList.textContent = '';
  
  availableActions.forEach(action => {
    const item = createShortcutItem(action);
    shortcutsList.appendChild(item);
  });
}

function createShortcutItem(action) {
  const item = document.createElement('div');
  item.className = 'shortcut-item';
  
  const infoDiv = document.createElement('div');
  infoDiv.className = 'shortcut-info';
  
  const nameDiv = document.createElement('div');
  nameDiv.className = 'action-name';
  nameDiv.textContent = action.name;
  
  const descDiv = document.createElement('div');
  descDiv.className = 'action-description';
  descDiv.textContent = action.description;
  
  infoDiv.appendChild(nameDiv);
  infoDiv.appendChild(descDiv);
  
  const inputWrapper = document.createElement('div');
  inputWrapper.className = 'shortcut-input-wrapper';
  
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'shortcut-input';
  input.placeholder = 'Press keys...';
  input.dataset.actionId = action.id;
  input.value = action.defaultShortcut || '';
  input.readOnly = true;
  input.addEventListener('keydown', handleShortcutInput);
  input.addEventListener('focus', () => {
    input.value = 'Waiting...';
    input.classList.add('recording');
    input.classList.remove('valid', 'invalid');
  });
  
  inputWrapper.appendChild(input);
  
  item.appendChild(infoDiv);
  item.appendChild(inputWrapper);
  
  return item;
}

function handleShortcutInput(event) {
  event.preventDefault();
  
  const input = event.target;
  
  const parts = [];
  
  if (event.ctrlKey) parts.push('Ctrl');
  if (event.altKey) parts.push('Alt');
  if (event.shiftKey) parts.push('Shift');
  if (event.metaKey) parts.push('Command');
  
  const key = event.key;
  if (!['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
    const normalizedKey = key.length === 1 ? key.toUpperCase() : key;
    parts.push(normalizedKey);
  }
  
  if (parts.length > 0 && ['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
     input.value = parts.join('+') + '...';
     return;
  }
  const shortcut = parts.join('+');
  input.value = shortcut;
  
  const validation = validateShortcut(input, shortcut);
  
  if (validation.isValid) {
     input.classList.remove('recording');
     input.classList.add('valid');
     input.classList.remove('invalid');
     input.blur();
  } else {
     input.classList.add('invalid');
     input.classList.remove('valid');
     showStatus(validation.message, 'error');
  }
}

function validateShortcut(input, shortcut) {
  const inputs = document.querySelectorAll('.shortcut-input');
  let isConflict = false;
  let conflictingAction = '';
  const modifiers = ['Ctrl', 'Alt', 'Shift', 'Command', 'Meta', 'MacCtrl'];
  const parts = shortcut.split('+');
  const modCount = parts.filter(p => modifiers.includes(p)).length;
  
  if (modCount > 2) {
      return {
          isValid: false,
          message: `Forbidden: Too many modifiers (${modCount}). Max 2 allowed (e.g. Ctrl+Alt+F).`
      };
  }
  
  inputs.forEach(otherInput => {
    if (otherInput !== input && otherInput.value === shortcut) {
      isConflict = true;
      const card = otherInput.closest('.shortcut-card');
      const title = card.querySelector('h3') ? card.querySelector('h3').textContent : 'another action';
      conflictingAction = title;
    }
  }); 
  
  if (isConflict) {
    return {
      isValid: false,
      message: `Conflict! This shortcut is already used by "${conflictingAction}"`
    };
  }
  
  return { isValid: true, message: '' };
}

async function handleSave() {
  const saveBtn = document.getElementById('save-btn');
  const originalContent = saveBtn.textContent;
  
  try {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    
    const inputs = document.querySelectorAll('.shortcut-input');
    const newShortcuts = {};
    
    let hasInvalid = false;
    inputs.forEach(input => {
      if (input.classList.contains('invalid')) {
        hasInvalid = true;
      }
      
      const actionId = input.dataset.actionId;
      const shortcut = input.value;
      
      if (shortcut && shortcut !== 'Waiting...' && shortcut !== 'Press keys...') {
        newShortcuts[actionId] = shortcut;
      }
    });
    
    if (hasInvalid) {
      showStatus('Please fix invalid shortcuts', 'error');
      saveBtn.disabled = false;
      saveBtn.textContent = originalContent;
      return;
    }
    
    for (const [actionId, shortcut] of Object.entries(newShortcuts)) {
      try {
        console.log(`[RaiKey Options] Updating command ${actionId} to ${shortcut}`);
        await browser.commands.update({
          name: actionId,
          shortcut: shortcut
        });
      } catch (error) {
        console.error(`[RaiKey] Error updating command ${actionId}:`, error);
        
        const input = document.querySelector(`.shortcut-input[data-action-id="${actionId}"]`);
        if (input) {
            let resetVal = currentSettings.shortcuts[actionId];
            if (!resetVal) {
                const action = availableActions.find(a => a.id === actionId);
                resetVal = action ? action.defaultShortcut : '';
            }
            input.value = resetVal || '';
            input.classList.remove('valid', 'invalid');
        }

        let userMessage = 'Error';      
        if (error.message.includes('one or two modifiers')) {
          userMessage = `Forbidden: "${shortcut}" has too many modifiers. Firefox limits shortcuts to max 2 modifiers (e.g. Ctrl+Alt+F is allowed, but Ctrl+Alt+Shift+F is blocked).`;
          throw new Error(userMessage);
        } else if (error.message.includes('media key')) {
          throw new Error(`Invalid key: "${shortcut}" is not a valid combination.`);
        } else {
          throw new Error(`Unsupported: "${shortcut}" could not be saved.`);
        }
      }
    }
    
    currentSettings.shortcuts = newShortcuts;
    await saveSettings(currentSettings);
    
    showStatus('Settings saved successfully', 'success');
  } catch (error) {
    console.error('[RaiKey Options] Save error:', error);
    showStatus(error.message, 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = originalContent;
  }
}

async function handleReset() {
  if (!confirm('Are you sure you want to reset all shortcuts to default values?')) {
    return;
  }
  
  try {
    await resetSettings();
    
    const commands = await browser.commands.getAll();
    for (const cmd of commands) {
      if (cmd.shortcut) {
        await browser.commands.reset(cmd.name);
      }
    }
    
    location.reload();
  } catch (error) {
    console.error('[RaiKey Options] Reset error:', error);
    showStatus('Error resetting settings', 'error');
  }
}

function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `toast ${type} show`;
  
  setTimeout(() => {
    statusMessage.classList.remove('show');
  }, 3000);
}

function getActionDisplayName(actionId) {
  const names = {
    'detach-tab': 'Detach Tab',
    'duplicate-tab': 'Duplicate Tab'
  };
  return names[actionId] || actionId;
}
saveBtn.addEventListener('click', handleSave);
resetBtn.addEventListener('click', handleReset);

document.addEventListener('DOMContentLoaded', () => {
  init();  
  const navItems = document.querySelectorAll('.nav-item');
  const views = {
    'Shortcuts': document.getElementById('view-shortcuts'),
    'About': document.getElementById('view-about')
  };
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      const viewName = item.textContent.trim().split('\n').pop().trim();
      Object.values(views).forEach(el => {
        if(el) el.style.display = 'none';
      });
      if (views[viewName]) {
        views[viewName].style.display = 'block';
      }
    });
  });
});
