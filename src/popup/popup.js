document.addEventListener('DOMContentLoaded', async () => {
  const detachBtn = document.getElementById('detach-btn');
  const detailsElement = document.getElementById('detach-shortcut');
  const duplicateBtn = document.getElementById('duplicate-btn');
  const duplicateDetailsElement = document.getElementById('duplicate-shortcut');
  const quickCleanBtn = document.getElementById('quick-clean-btn');
  const quickCleanDetailsElement = document.getElementById('quick-clean-shortcut');
  const settingsBtn = document.getElementById('settings-btn');

  try {
    const commands = await browser.commands.getAll();
    const detachCommand = commands.find(c => c.name === 'detach-tab');
    if (detachCommand && detachCommand.shortcut) {
      detailsElement.textContent = detachCommand.shortcut;
    } else {
      detailsElement.textContent = 'Unbound';
    }

    const duplicateCommand = commands.find(c => c.name === 'duplicate-tab');
    if (duplicateCommand && duplicateCommand.shortcut) {
      duplicateDetailsElement.textContent = duplicateCommand.shortcut;
    } else {
      duplicateDetailsElement.textContent = 'Unbound';
    }

    const quickCleanCommand = commands.find(c => c.name === 'quick-clean');
    if (quickCleanCommand && quickCleanCommand.shortcut) {
      quickCleanDetailsElement.textContent = quickCleanCommand.shortcut;
    } else {
      quickCleanDetailsElement.textContent = 'Unbound';
    }
  } catch (err) {
    console.error('Failed to load shortcuts:', err);
    detailsElement.textContent = '';
    duplicateDetailsElement.textContent = '';
    quickCleanDetailsElement.textContent = '';
  }

  detachBtn.addEventListener('click', async () => {
    try {
      const response = await browser.runtime.sendMessage({ type: 'executeAction', actionId: 'detach-tab' });
      
      if (response && response.success === false) {
        throw new Error(response.error || 'Unknown error');
      }
      
      window.close();
    } catch (error) {
      console.error('Error sending detach command:', error);
      detachBtn.style.backgroundColor = 'hsl(var(--destructive))';
      detachBtn.style.color = 'hsl(var(--destructive-foreground))';
      detachBtn.querySelector('.text').textContent = error.message.substring(0, 20) + '...';
      
      setTimeout(() => {
        detachBtn.style.backgroundColor = '';
        detachBtn.style.color = '';
        detachBtn.querySelector('.text').textContent = 'Detach Tab';
      }, 3000);
    }
  });

  duplicateBtn.addEventListener('click', async () => {
    try {
      const response = await browser.runtime.sendMessage({ type: 'executeAction', actionId: 'duplicate-tab' });
      
      if (response && response.success === false) {
        throw new Error(response.error || 'Unknown error');
      }
      
      window.close();
    } catch (error) {
      console.error('Error sending duplicate command:', error);
      duplicateBtn.style.backgroundColor = 'hsl(var(--destructive))';
      duplicateBtn.style.color = 'hsl(var(--destructive-foreground))';
      duplicateBtn.querySelector('.text').textContent = error.message.substring(0, 20) + '...';
      
      setTimeout(() => {
        duplicateBtn.style.backgroundColor = '';
        duplicateBtn.style.color = '';
        duplicateBtn.querySelector('.text').textContent = 'Duplicate Tab';
      }, 3000);
    }
  });

  quickCleanBtn.addEventListener('click', async () => {
    try {
      const response = await browser.runtime.sendMessage({ type: 'executeAction', actionId: 'quick-clean' });
      
      if (response && response.success === false) {
        throw new Error(response.error || 'Unknown error');
      }
      
      window.close();
    } catch (error) {
      console.error('Error sending quick clean command:', error);
      quickCleanBtn.style.backgroundColor = 'hsl(var(--destructive))';
      quickCleanBtn.style.color = 'hsl(var(--destructive-foreground))';
      quickCleanBtn.querySelector('.text').textContent = error.message.substring(0, 20) + '...';
      
      setTimeout(() => {
        quickCleanBtn.style.backgroundColor = '';
        quickCleanBtn.style.color = '';
        quickCleanBtn.querySelector('.text').textContent = 'Quick Clean';
      }, 3000);
    }
  });

  settingsBtn.addEventListener('click', () => {
    browser.runtime.openOptionsPage();
    window.close();
  });
});
