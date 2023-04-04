import React, {Fragment} from 'react';
import ButtonGroup from '@atlaskit/button/button-group';
import LoadingButton from '@atlaskit/button/loading-button';
import Button from '@atlaskit/button/standard-button';
import Clipboard from 'clipboard';
import CopyIcon from '@atlaskit/icon/glyph/copy';
import InlineDialog from '@atlaskit/inline-dialog';
import ReactMarkdown from 'react-markdown';
import TextArea from '@atlaskit/textarea';
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

const Page = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  height: 100vh;
  width: 100vw;
`;

const Wrapper = styled.div`
  display: flex;
  max-width: 768px;
  margin: 0 auto;
  max-height: 768px;
  overflow-y: auto;
`;

const ChatBox = styled.div`
  width: 100%;
  margin: 0 auto;
  padding-left: 16px;
`;

const FormDefaultExample = () => {
  // TODO: redefine the message.
  const [messages, setMessages] = React.useState('');
  const [currentPrompt, setCurrentPrompt] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const copyBtnRef = React.useRef();
  const inputRef = React.useRef();

  let onSubmit = async (data) => {
    setMessages('')
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
      const decoder = new TextDecoder()
      const reader = response.body.getReader();

      let done = false;
      const resultStrArr = []

      while (!done) {
        const {value, done: doneReading} = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        resultStrArr.concat()
        const strArr = chunkValue.split(`\n`).map(item => item.replace('data: ', ''))
        console.debug('strArr', strArr);
        for (let i in strArr) {
          if (strArr[i]) {
            // if strArr[i] is '[DONE]', then it is the last message. Set done to true.
            if (strArr[i] === '[DONE]') {
              done = true
              break
            }
            const json = JSON.parse(strArr[i])
            if (json) {
              if (json.choices[0].delta) {
                const text = json.choices[0].delta.content || ''
                setMessages(prev => prev + text)
              }

            }
          }
        }
      }
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
  }

  return (
    <Page>
      <DebugComponent/>
      <Wrapper>
        <PreDefinedPrompts onSelect={handleSelect}/>
        <ChatBox>
          <Form onSubmit={onSubmit}>
            {({formProps, submitting}) => (
              <form {...formProps}>
                <FormHeader title='Queries'/>
                <FormSection>
                  <Field label='Enter your request here:' name='query'>
                    {({fieldProps}) => (
                      <Fragment>
                        <TextArea
                          ref={inputRef}
                          placeholder='e.g. Write a Job Description for Senior DevOps Engineer'
                          {...fieldProps}
                        />
                        <HelperMessage>
                          Go to{' '}
                          <a
                            href={`https://www.gptdock.com/how-to-ask-questions`}
                          >
                            How to ask questions
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
                  </ButtonGroup>
                </FormFooter>
              </form>
            )}
          </Form>
          {/* TODO: integrate with the API response */}
          <div style={{display: 'flex', justifyContent: 'flex-start'}}>
            {messages && (
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
          <ReactMarkdown children={messages}/>
        </ChatBox>
      </Wrapper>
    </Page>
  );
};

export default FormDefaultExample;
