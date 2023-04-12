import remarkGfm from 'remark-gfm';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/cjs/prism-light';
import {oneLight} from 'react-syntax-highlighter/dist/cjs/styles/prism';
import React from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';

const StyledMarkdown = styled(ReactMarkdown)`
  margin-top: 16px;

  tr {
    border-bottom: 1px solid #eee;
  }
`;

const CodeBlockBox = styled.div`
  position: relative;
`

const CodeBlock = ({_, inline, className, children, ...props}) => {
  const match = /language-(\w+)/.exec(className || '')
  const content = String(children).replace(/\n$/, '')
  console.log(inline)
  return (
    !inline && match ? (
      <CodeBlockBox>
        <SyntaxHighlighter
          {...props}
          children={content}
          style={oneLight}
          language={match[1]}
          PreTag='div'
        />
      </CodeBlockBox>
    ) : (
      <code {...props} className={className}>
        {children}
      </code>
    )
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