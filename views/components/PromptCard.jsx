import React from 'react';
import styled from 'styled-components';

const CardWrapper = styled.div`
  box-shadow: var(--ds-shadow-raised,0 1px 1px rgba(9,30,66,0.25),0 0 1px rgba(9,30,66,0.31));
  padding: 16px;
  border-radius: 3px;
  cursor: pointer;
  margin-bottom: 8px;

  &:hover {
    background: #f2f2f2;
  }
`;

const PromptCard = ({title, content, onClick }) => {
  return (
    <CardWrapper onClick={() => onClick(content)}>
      { title }
    </CardWrapper>
  )
};

export default PromptCard;
