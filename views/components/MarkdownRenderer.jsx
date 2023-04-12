import remarkGfm from 'remark-gfm';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/cjs/prism-light';
import {oneLight} from 'react-syntax-highlighter/dist/cjs/styles/prism';
import React, {useRef} from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import CopyIcon from '@atlaskit/icon/glyph/copy';
import Button from '@atlaskit/button/standard-button';
import Clipboard from 'clipboard';

const StyledMarkdown = styled(ReactMarkdown)`
  margin-top: 16px;

  tr {
    border-bottom: 1px solid #eee;
  }
  
  p {
    font-size: 1em;
    line-height: 1.714;
    font-weight: normal;
    margin-top: 0.75rem;
    margin-bottom: 0px;
    letter-spacing: -0.005em;
  }
`;

const CodeBlockBox = styled.div`
  position: relative;

  &:hover {
    > button {
      visibility: visible;
    }
  }
`

const StyledButton = styled(Button)`
  visibility: hidden;
  cursor: pointer;
  position: absolute !important;
  right: 4px;
  top: 6px;
`

const InlineCode = styled.code`
  background: var(--ds--code--bg-color,var(--ds-background-neutral, #F4F5F7));
  border-radius: 3px;
  padding: 2px 0.5ch;
`


const CodeBlock = ({_, inline, className, children, ...props}) => {
  const match = /language-(\w+)/.exec(className || '')
  const content = String(children).replace(/\n$/, '')
  const copyBtnRef = useRef()

  const handleCopy = React.useCallback(
    (event) => {

      const clipboard = new Clipboard(copyBtnRef.current, {
        text: () => content,
      });

      clipboard.onClick(event);

      return () => {
        clipboard.destroy();
      };
    },
    [content]
  );

  return !inline && match ? (
    <CodeBlockBox>
      <StyledButton
        onClick={handleCopy}
        ref={copyBtnRef}
        iconBefore={<CopyIcon label='' size='medium'/>}
      />
      <SyntaxHighlighter
        {...props}
        children={content}
        style={oneLight}
        language={match[1]}
        PreTag='div'
      />
    </CodeBlockBox>
  ) : (
    <InlineCode {...props} className={className}>
      {children}
    </InlineCode>
  )
}

const MarkdownRenderer = ({content}) => {
  return (
    <StyledMarkdown children={content} remarkPlugins={[remarkGfm]} components={{
      code: CodeBlock
    }}/>
  )
}

export default MarkdownRenderer