import React from 'react';
import styled from 'styled-components';
import { getIsDebugEnv } from '../../utils';

const Wrapper = styled.div`
  z-index: 9999;
  position: fixed;
  top: 20px;
  left: 20px;
  display: flex;
  flex-wrap: nowrap;
  font-size: 12px;
  max-width: calc(100vw - 80px);
`;

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

  displayUrl() {
    const url = window.location.href;
    return url.length > 250 ? `${url.slice(0, 250)}...` : url;
  }

  render() {
    if (!getIsDebugEnv()) return null;

    const inIframe = this.isInIframe();

    return (
      <Wrapper>
        {inIframe && (
          <button onClick={this.reloadIframe} style={{ marginRight: '10px' }}>
            Reload iFrame
          </button>
        )}
        {this.displayUrl()}
      </Wrapper>
    );
  }
}

export default DebugComponent;
