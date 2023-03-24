import React, { Fragment } from 'react';

import ButtonGroup from '@atlaskit/button/button-group';
import LoadingButton from '@atlaskit/button/loading-button';
import Button from '@atlaskit/button/standard-button';
import { Checkbox } from '@atlaskit/checkbox';
import TextField from '@atlaskit/textfield';
import Clipboard from 'clipboard';
import CopyIcon from '@atlaskit/icon/glyph/copy';
import InlineDialog from '@atlaskit/inline-dialog';
import ReactMarkdown from 'react-markdown';


import TextArea from '@atlaskit/textarea';
import Form, {
  CheckboxField,
  ErrorMessage,
  Field,
  FormFooter,
  FormHeader,
  FormSection,
  HelperMessage,
  ValidMessage,
} from '@atlaskit/form';

const FormDefaultExample = () => {
  // TODO: redefine the message.
  const [messages, setMessages] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const copyBtnRef = React.useRef();

  let onSubmit = async (data) => {
    // try fetch data from server, if error, set error message, if success, set success message
    try {
      const response = await fetch('/conversations', {
        method: 'POST',
        body: JSON.stringify({
          "action": "next",
          "messages": [
            {
              "id": "b059aadc-e7b8-4b58-9aa8-c73a855df536",
              "author": {
                "role": "user"
              },
              "role": "user",
              "content": {
                "content_type": "text",
                "parts": [
                  data.query
                ]
              }
            }
          ],
          "parent_message_id": "d53b8c5b-8cc9-4d06-a164-cef3cd8571e5",
          "model": "text-davinci-002"
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      });
      const result = await response.text();

      if (result) {
        setMessages(result)
      }
    } catch (e) {
      // TODO: should not set the error message.
      setMessages('An error occurred, please try again later.');
    }
  };

  const handleError = React.useCallback(() => {
    console.warn('Copy failed.');
  }, [])

  const handleSuccess = React.useCallback(() => {
    setCopied(true);
  }, [])

  const handleCopy = React.useCallback((event) => {
    const clipboard = new Clipboard(copyBtnRef.current, {
      text: () => messages,
    });

    clipboard.on('success', handleSuccess);

    clipboard.on('error', handleError);

    clipboard.onClick(event);

    return () => {
      clipboard.destroy();
    };
  }, [messages, handleError, handleSuccess])


  return (
    <div
      style={{
        display: 'flex',
        width: '400px',
        maxWidth: '100%',
        margin: '0 auto',
        flexDirection: 'column',
      }}
    >
      <Form onSubmit={onSubmit}>
        {({ formProps, submitting }) => (
          <form {...formProps}>
            <FormHeader title='Queries' />
            <FormSection>
              <Field label='Enter your request here:' name='query'>
                {({ fieldProps }) => (
                  <Fragment>
                    <TextArea
                      placeholder='e.g. Write a Job Description for Senior DevOps Engineer'
                      {...fieldProps}
                    />
                    <HelperMessage>
                      Go to{' '}
                      <a href={`https://www.gptdock.com/how-to-ask-questions`}>
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
      <ReactMarkdown children={messages}/>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {messages && (
          <InlineDialog
            onClose={() => setCopied(false)}
            content='Copied Successful'
            isOpen={copied}
          >
            <Button
              ref={copyBtnRef}
              onClick={handleCopy}
              iconBefore={<CopyIcon label='' size='medium' />}
            />
          </InlineDialog>
        )}
      </div>
    </div>
  );
};

export default FormDefaultExample;
