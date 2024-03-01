import React, { useEffect } from 'react';
import styled from 'styled-components';
import DebugComponent from './components/DebugComponent';
import SaveButton from './components/SaveButton';
import Conversations from './components/Conversations';
import Mermaid from './components/Mermaid';
import MessageSender from './components/MessageSender';
import { v4 as uuidv4 } from 'uuid';
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

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/javascript/javascript.js';

import { UnControlled as CodeMirror } from 'react-codemirror2'


const codeMirrorOptions = {
  mode: 'javascript',
  tabSize: 4,
  theme: 'monokai',
  lineNumbers: true,
  line: true,
  // keyMap: "sublime",
  extraKeys: { "Ctrl": "autocomplete" },
  foldGutter: true,
  gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
  styleSelectedText: true,
  highlightSelectionMatches: { showToken: /\w/, annotateScrollbar: true },
  placeholder: 'Write you code here',
  autoCloseBrackets: true,
};

const Dashboard = () => {
  const [sessions, setSessions] = React.useState([]);
  const [dsl, setDsl] = React.useState('');

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
        const answer = await response.json();

        const matchResult = answer.match(/```(json|mermaid)?([\s\S]*?)```/);
        if(!matchResult) {
          console.error(`Unparsable GPT answer:`, answer);
        }
        const content = matchResult && matchResult[2];
        console.debug('Extracted content:', content);
        setDsl(content);

        setSessions((prev) => {
          const updatedSessions = prev.map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
                message: answer,
                loading: false,
              };
            }
            return chat;
          });
          return updatedSessions;
        });
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

  const handleDslChange = (editor, data, value) => setDsl(value);

  useEffect(() => {
    // there is a margin on document.body, perhaps added by Confluence since I didn't found related logic in our code, remove it because it causes a unwanted scrollbar
    observeDomChanges(document.body, () => (document.body.style.margin = '0'));
  }, []);

  return (
    <Page>
      <DebugComponent />
      <Wrapper>
        <SaveButton dsl={dsl} contentId="xxadddf" creatorId="creator_idxxx" />
        <Conversations sessions={sessions} />

        {dsl && <CodeMirror value={dsl} options={codeMirrorOptions} onChange={handleDslChange} />}
        <Mermaid dsl={dsl} />
        <MessageSender onSubmit={handleSubmit} placeholder={'Enter an image URL here'} />
      </Wrapper>
    </Page>
  );
};

export default Dashboard;
