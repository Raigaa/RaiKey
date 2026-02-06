document.addEventListener('DOMContentLoaded', async () => {
  const detachBtn = document.getElementById('detach-btn');
  const detailsElement = document.getElementById('detach-shortcut');
  const settingsBtn = document.getElementById('settings-btn');

  try {
    const commands = await browser.commands.getAll();
    const detachCommand = commands.find(c => c.name === 'detach-tab');
    if (detachCommand && detachCommand.shortcut) {
      detailsElement.textContent = detachCommand.shortcut;
    } else {
      detailsElement.textContent = 'Unbound';
    }
  } catch (err) {
    console.error('Failed to load shortcuts:', err);
    detailsElement.textContent = '';
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

  settingsBtn.addEventListener('click', () => {
    browser.runtime.openOptionsPage();
    window.close();
  });
});
