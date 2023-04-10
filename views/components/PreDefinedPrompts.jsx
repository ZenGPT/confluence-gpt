import React from 'react';
import PromptCard from './PromptCard';
import { PRE_DEFINED_PROMPTS } from '../constant/prompt';
import styled from 'styled-components';

const ListWrapper = styled.div`
  padding-top: 16px;
  position: sticky;
`;

const StyledHeading = styled.h3`
  margin-bottom: 10px;
  font-size: 16px;
`;

const PreDefinedPrompts = ({ onSelect }) => {
  return (
    <ListWrapper>
      <StyledHeading level='h400'>Predefined Prompts</StyledHeading>
      {PRE_DEFINED_PROMPTS.map((prompt) => (
        <PromptCard key={prompt} content={prompt} onClick={onSelect}/>
      ))}
    </ListWrapper>
  );
};

export default PreDefinedPrompts;
