chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    hologramPdfInstalledAt: new Date().toISOString()
  });
});
