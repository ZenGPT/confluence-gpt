/**
 * @param {HTMLElement} dom
 * @param {(mutations: MutationRecord[], observer: MutationObserver) => void} callback
 * @return {void}
 */
export const observeDomChanges = (dom, callback) => {
  const observer = new MutationObserver(callback);
  const config = { attributes: true, childList: true, subtree: true };
  observer.observe(dom, config);
};

export const getIsDebugEnv = () => {
  const localStorageFlag = localStorage.getItem('gptdock-debug') === 'true';
  const url = window.location.href;
  const queryParams = new URLSearchParams(window.location.search);

  return Boolean(
    localStorageFlag ||
      url.includes('ngrok') ||
      url.includes('localhost') ||
      queryParams.get('debug') === 'true'
  );
};
