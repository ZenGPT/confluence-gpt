import React, {Fragment, useEffect} from 'react';
import ButtonGroup from '@atlaskit/button/button-group';
import LoadingButton from '@atlaskit/button/loading-button';
import Button from '@atlaskit/button/standard-button';
import Clipboard from 'clipboard';
import CopyIcon from '@atlaskit/icon/glyph/copy';
import InlineDialog from '@atlaskit/inline-dialog';
import ReactMarkdown from 'react-markdown';
import TextArea from '@atlaskit/textarea';
import ProgressBar from '@atlaskit/progress-bar';
import Form, {
  Field,
  FormFooter,
  FormHeader,
  FormSection,
  HelperMessage,
} from '@atlaskit/form';
import PreDefinedPrompts from './components/PreDefinedPrompts';
import styled from 'styled-components'
import DebugComponent from "./components/DebugComponent";
import {processStream} from "./StreamProcessor/StreamProcessor.mjs";
import remarkGfm from "remark-gfm";
import SectionMessage, { SectionMessageAction } from '@atlaskit/section-message';
import * as clientApi from '../libs/api';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism-light';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const WARNING_USAGE = 0.15

const Page = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  height: 100vh;
  width: 1024px;
  margin: 0 auto;
`;

const Wrapper = styled.div`
  display: flex;
  height: auto;
  width: 100%;
  margin: 0 auto;
  overflow-y: auto;
`;

const LeftBox = styled.div`
  max-width: 520px;
  min-width: 260px;
  padding-left: 16px;
  padding-right: 16px;
  border-right: 1px solid #eeeeee;
`

const QuotaBox = styled.div`
  margin-top: 30px;
`;

const ChatBox = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;
  width: 100%;
  margin: 0 auto;
  padding-left: 16px;
  padding-top: 16px;

  h2 {
    line-height: 1;
  }
`;

const StyledMarkdown = styled(ReactMarkdown)`
  margin-top: 16px;

  tr {
    border-bottom: 1px solid  #eee;
  }
`;

const FormDefaultExample = () => {
  // TODO: redefine the message.
  const [messages, setMessages] = React.useState('');
  const [currentPrompt, setCurrentPrompt] = React.useState('');
  const [tokenUsageRatio, setTokenUsageRatio] = React.useState()
  const [copied, setCopied] = React.useState(false);
  const copyBtnRef = React.useRef();
  const inputRef = React.useRef();
  const hasError = messages.startsWith('An error occurred')

  let onSubmit = async (data) => {
    setMessages('')
    // TODO: move this part to /libs/api
    // try fetch data from server, if error, set error message, if success, set success message
    try {
      const token = await AP.context.getToken();
      const response = await fetch(`/conversations?jwt=${token}`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'next',
          messages: [
            {
              id: 'b059aadc-e7b8-4b58-9aa8-c73a855df536',
              author: {
                role: 'user',
              },
              role: 'user',
              content: {
                content_type: 'text',
                parts: [data.query || currentPrompt],
              },
            },
          ],
          parent_message_id: 'd53b8c5b-8cc9-4d06-a164-cef3cd8571e5',
          model: 'text-davinci-002',
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8'
        },
      });

      // TODO: abstract to a lib function
      // const decoder = new TextDecoder()
      const reader = response.body.getReader();
      await processStream(reader, (text) => {
        setMessages(prev => prev + text)
      });
      await getTokenUsageRatio()
    } catch (e) {
      console.warn(e)
      // TODO: should not set the error message.
      setMessages('An error occurred, please try again later.');
    }
  };

  const handleError = React.useCallback(() => {
    console.warn('Copy failed.');
  }, []);

  const handleSuccess = React.useCallback(() => {
    setCopied(true);
  }, []);

  const handleCopy = React.useCallback(
    (event) => {
      const clipboard = new Clipboard(copyBtnRef.current, {
        text: () => messages,
      });

      clipboard.on('success', handleSuccess);

      clipboard.on('error', handleError);

      clipboard.onClick(event);

      return () => {
        clipboard.destroy();
      };
    },
    [messages, handleError, handleSuccess]
  );

  const handleSelect = (prompt) => {
    inputRef.current.value = prompt
    // TODO: form query does not update
    setCurrentPrompt(prompt)
    inputRef.current.style.height = 'auto';
    const scrollHeight = inputRef.current.scrollHeight
    inputRef.current.style.height =  scrollHeight + 'px';
  }

  const getTokenUsageRatio = async () => {
    const quotaData = await clientApi.queryTokenUsage()
    if (quotaData) {
      const { max_quota, quota_used } = quotaData
      setTokenUsageRatio((quota_used / max_quota).toFixed(2))
    }
  }

  useEffect(() => {
    (async () => {
      await getTokenUsageRatio()
    })()
  }, [])

  return (
    <Page>
      <DebugComponent/>
      <Wrapper>
        <LeftBox>
          <PreDefinedPrompts onSelect={handleSelect}/>
          {
            1 - tokenUsageRatio <= WARNING_USAGE && <QuotaBox>
              <SectionMessage
                appearance="warning"
                // TODO: add topup action button
                actions={[
                  <SectionMessageAction key='topup' onClick={() => window.open('https://zenuml.atlassian.net/servicedesk/customer/portals', '_blank', 'noreferrer')}>Top Up</SectionMessageAction>
                ]}>
                <div>
                  <p style={{marginBottom: '6px'}}>Token usage below {(1 - tokenUsageRatio) * 100}%</p>
                  <ProgressBar ariaLabel={`Remains {(1 - tokenUsageRatio) * 100}%`} value={1 - tokenUsageRatio} />
                </div>
              </SectionMessage>
            </QuotaBox>
          }
        </LeftBox>
        <ChatBox>
          <Form onSubmit={onSubmit}>
            {({formProps, submitting}) => (
              <form {...formProps}>
                <FormHeader title='Your Prompts'/>
                <FormSection>
                  <Field name='query'>
                    {({fieldProps}) => (
                      <Fragment>
                        <TextArea
                          ref={inputRef}
                          resize='smart'
                          value={currentPrompt}
                          placeholder='e.g. Write a Job Description for Senior DevOps Engineer'
                          {...fieldProps}
                        />
                        <HelperMessage>
                          Go to{' '}
                          <a target='_blank' rel="noreferrer"
                            href={`https://github.com/ZenGPT/confluence-gpt/wiki/Crafting-Effective-Prompts`}
                          >
                            Crafting Effective Prompts
                          </a>{' '}
                          for more information.
                        </HelperMessage>
                      </Fragment>
                    )}
                  </Field>
                </FormSection>

                <FormFooter>
                  <ButtonGroup>
                    <LoadingButton
                      type='submit'
                      appearance='primary'
                      isLoading={submitting}
                    >
                      Submit
                    </LoadingButton>
                    <Button type={'button'} appearance={'subtle'} onClick={() => {AP.dialog.close()}}>Close</Button>
                  </ButtonGroup>
                </FormFooter>
              </form>
            )}
          </Form>
          <div style={{width: '100%', display: 'flex', flexDirection: 'flex-row', justifyContent: 'flex-start', overflowY: 'hidden'}}>
            <div className={'content'} style={{flexGrow: 1, overflowY: 'scroll'}}>
              <StyledMarkdown children={messages} remarkPlugins={[remarkGfm]} components={{
                code({_, inline, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                    <SyntaxHighlighter
                      {...props}
                      children={String(children).replace(/\n$/, '')}
                      style={oneLight}
                      language={match[1]}
                      PreTag="div"
                    />
                  ) : (
                    <code {...props} className={className}>
                      {children}
                    </code>
                  )
                }
              }}/>
            </div>
            {messages && !hasError && (
                <InlineDialog
                    onClose={() => setCopied(false)}
                    content='Copied Successful'
                    isOpen={copied}
                >
                  <Button
                      ref={copyBtnRef}
                      onClick={handleCopy}
                      iconBefore={<CopyIcon label='' size='medium'/>}
                  />
                </InlineDialog>
            )}
          </div>
        </ChatBox>
      </Wrapper>
    </Page>
  );
};

export default FormDefaultExample;
