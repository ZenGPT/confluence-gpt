import React from 'react';

class DebugComponent extends React.Component {
  isInIframe() {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }

  reloadIframe() {
    window.location.reload();
  }

  shouldShowDebug() {
    const localStorageFlag = localStorage.getItem('gptdock-debug') === 'true';
    const url = window.location.href;
    const queryParams = new URLSearchParams(window.location.search);

    return (
        localStorageFlag ||
        url.includes('ngrok') ||
        url.includes('localhost') ||
        queryParams.get('debug') === 'true'
    );
  }

  displayUrl() {
    const url = window.location.href;
    return url.length > 250 ? `${url.slice(0, 250)}...` : url;
  }

  render() {
    if (!this.shouldShowDebug()) return null;

    const inIframe = this.isInIframe();

    return (
        <div style={{ zIndex: 9999 }}>
          {this.displayUrl()}
          {inIframe && (
              <button onClick={this.reloadIframe} style={{ marginLeft: '10px' }}>
                Reload iFrame
              </button>
          )}
        </div>
    );
  }
}

export default DebugComponent;
