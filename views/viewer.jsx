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

const Viewer = () => {
  const [sessions, setSessions] = React.useState([]);
  const [dsl, setDsl] = React.useState('');

  useEffect(() => {
		  const fetchData = async () => {

		      AP.confluence.getMacroBody(function(body){
            console.log('body:'+ body);
          });

		      AP.confluence.getMacroData(function(data){
		          if(data){
		            const customContentId = data.contentId;
		            AP.request({
                   url: `/rest/api/content/${customContentId}`,
                   data: {
                     "expand": "body.raw"
                   },
	                  success: function (response) {
	                    setDsl(JSON.parse(JSON.parse(response).body.raw.value).dsl);
	                    setTimeout(AP.resize, 1500)
	                  }
                });
		          }else{
		            console.log("data is not exists");
		          }
          });

		  };
		  fetchData();
  },[]);


  return (
    <Page>
      <Wrapper>
        <Mermaid dsl={dsl}  />
      </Wrapper>
    </Page>
  );
};

export default Viewer;
