import React from 'react';
import styled from 'styled-components';
import WarningIcon from '@atlaskit/icon/glyph/warning';

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  background-color: var(--ds-background-warning, #FFFAE6);
  border-radius: 3px;
  padding: 4px 8px;
  margin: 8px 0 8px 0;
  font-size: 12px;
`;

const WARNING_USAGE = 0.15;

const QuotaWarning = (tokenUsageRatio) => {
  if (1 - tokenUsageRatio <= WARNING_USAGE) {
    return (
      <Wrapper>
        <span><WarningIcon size='small' primaryColor='var(--ds-icon-warning, #FF8B00)' /> Token usage below 15%</span><a href='https://zenuml.atlassian.net/servicedesk/customer/portals' target='_blank' rel='noreferrer'>Top up</a>
      </Wrapper>
    )
  }

  return null
};

export default QuotaWarning;
