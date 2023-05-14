import React, { FC, useRef } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import styled from 'styled-components';
import useScrollToBottom from '../hooks/useScrollToBottom';
import { Chat } from '../../type';

const ConversationWrapper = styled.div`
  padding: 60px 0;
  overflow-y: auto;
  flex: 1;
`;

const PlaceholderBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  flex-direction: column;
`;

const Conversations: FC<{ sessions: Chat[] }> = ({ sessions = [] }) => {
  const boxRef = useRef<HTMLDivElement>(null);

  useScrollToBottom(boxRef);

  if (sessions.length === 0) {
    return (
      <PlaceholderBox>
        <img alt="No contents here" src="/images/placeholder.svg" width={200} />
        No contents here yet...
      </PlaceholderBox>
    );
  }

  return (
    <ConversationWrapper ref={boxRef}>
      {sessions.map((chat) => {
        return (
          <MarkdownRenderer
            key={chat.id}
            loading={chat.loading}
            isGPT={chat.type === 'gpt'}
            content={chat.message}
            error={chat.error}
          />
        );
      })}
    </ConversationWrapper>
  );
};

export default Conversations;
