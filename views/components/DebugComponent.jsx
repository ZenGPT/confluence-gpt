import React from 'react';

class DebugComponent extends React.Component {
  render() {
    const showDebug = localStorage.getItem('gptdock-debug') === 'true';

    return showDebug ? (
        <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999 }}>
          {window.location.href}
        </div>
    ) : null;
  }
}

export default DebugComponent;
