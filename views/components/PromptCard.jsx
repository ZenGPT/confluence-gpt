import React from 'react';
import styled from 'styled-components';

const CardWrapper = styled.div`
  box-shadow: 0 2px 3px rgba(0,0,0,0.2);
  padding: 8px;
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
