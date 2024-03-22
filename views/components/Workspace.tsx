import React, { useEffect } from 'react';
import Split from 'split.js';
import Mermaid from './Mermaid';
import styled from 'styled-components';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/javascript/javascript.js';
import Conversations from './Conversations';
import './codemirror.css';

import { UnControlled as CodeMirror } from 'react-codemirror2'

const codeMirrorOptions = {
  mode: 'javascript',
  tabSize: 4,
  theme: 'monokai',
  lineNumbers: true,
  line: true,
  extraKeys: { "Ctrl": "autocomplete" },
  foldGutter: true,
  gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
  styleSelectedText: true,
  highlightSelectionMatches: { showToken: /\w/, annotateScrollbar: true },
  placeholder: 'Write you code here',
  autoCloseBrackets: true,
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
`;

const Workspace = ({ dsl = '', sessions = [] }) => {
  const [value, setValue] = React.useState('');

  const handleDslChange = (editor, data, value) => setValue(value);

  useEffect(() => {
    Split(['#workspace-column1', '#workspace-column2', '#workspace-column3'])
  }, []);

  useEffect(() => {
    setValue(dsl);
  }, [dsl]);

  return (
    <Wrapper>
      <div id="workspace-column1"><CodeMirror value={value || dsl} options={codeMirrorOptions} onChange={handleDslChange} /></div>
      <div id="workspace-column2"><Mermaid dsl={value || dsl} /></div>
      <div id="workspace-column3"><Conversations sessions={sessions} /></div>
    </Wrapper>
  );
};

export default Workspace;
