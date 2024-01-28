import React, { useEffect } from 'react';
import styled from 'styled-components';
import DebugComponent from './components/DebugComponent';
import { processStream } from './StreamProcessor/StreamProcessor.mjs';
import Conversations from './components/Conversations';
import MessageSender from './components/MessageSender';
import { v4 as uuidv4 } from 'uuid';
import Button from '@atlaskit/button';
import EditorCloseIcon from '@atlaskit/icon/glyph/editor/close';
import Tooltip from '@atlaskit/tooltip';
import { observeDomChanges } from '../utils';

const Page = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  height: 100vh;
  margin: 0 auto;
  overflow: hidden;
`;

const Wrapper = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  margin: 0 auto;
  flex-direction: column;
  flex-grow: 1;
  justify-content: space-between;
  overflow: hidden;
  h2 {
    line-height: 1;
  }
`;

const StyledButton = styled(Button)`
  && {
    position: fixed;
  }
  top: 16px;
  right: 16px;
`;

const FormDefaultExample = () => {
  const [sessions, setSessions] = React.useState([]);

  const handleSubmit = React.useCallback(
    async (input) => {
      const chat = {
        type: 'user',
        message: input,
        id: uuidv4(),
      };

      setSessions((prev) => [...prev, chat]);
      const chatId = uuidv4();
      const newMessage = {
        type: 'gpt',
        message: '',
        id: chatId,
        loading: true,
      };

      setSessions((prev) => [...prev, newMessage]);
      // TODO: move this part to /libs/api
      // try fetch data from server, if error, set error message, if success, set success message
      try {
        const token = await AP.context.getToken();
        const response = await fetch(`/image-to-dsl?jwt=${token}`, {
          method: 'POST',
          body: JSON.stringify({imageUrl: input}),
          headers: { 'Content-type': 'application/json; charset=UTF-8', },
        });

        // TODO: abstract to a lib function
        const json = await response.json();
        setSessions((prev) => {
          const updatedSessions = prev.map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
                message: JSON.stringify(json),
                loading: false,
              };
            }
            return chat;
          });
          return updatedSessions;
        });
        //   refresh qutta
      } catch (e) {
        setSessions((prev) => {
          const updatedSessions = prev.map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
                message: 'An error occurred, please try again later.',
                loading: false,
              };
            }
            return chat;
          });
          return updatedSessions;
        });
      }
    },
    [sessions]
  );

  useEffect(() => {
    // there is a margin on document.body, perhaps added by Confluence since I didn't found related logic in our code, remove it because it causes a unwanted scrollbar
    observeDomChanges(document.body, () => (document.body.style.margin = '0'));
  }, []);

  return (
    <Page>
      <DebugComponent />
      <Wrapper>
        <Conversations sessions={sessions} />
        <MessageSender onSubmit={handleSubmit} />
        <Tooltip content="Close the dialog">
          {(tooltipProps) => (
            <StyledButton
              {...tooltipProps}
              type="button"
              appearance="primary"
              onClick={() => {
                AP.dialog.close();
              }}
              iconBefore={<EditorCloseIcon />}
            />
          )}
        </Tooltip>
      </Wrapper>
    </Page>
  );
};

export default FormDefaultExample;