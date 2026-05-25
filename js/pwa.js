(function initPwa() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/js/sw.js', { scope: '/' })
      .then(reg => console.log('Service Worker registrado:', reg.scope))
      .catch(err => console.warn('Falha ao registrar Service Worker:', err));
  });

  const installBtn = document.getElementById('installBtn');
  if (!installBtn) return;

  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    installBtn.style.display = 'inline-flex';
  });

  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      console.log('Usuario aceitou instalar o PWA');
    } else {
      console.log('Usuario recusou instalar o PWA');
    }

    deferredPrompt = null;
    installBtn.style.display = 'none';
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installBtn.style.display = 'none';
  });
})();
