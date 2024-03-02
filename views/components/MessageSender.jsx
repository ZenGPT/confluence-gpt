import Form, { Field, HelperMessage } from '@atlaskit/form';
import React from 'react';
import Popup from '@atlaskit/popup';
import FileUploadButton from './FileUploadButton';
import PreDefinedPrompts from './PreDefinedPrompts';
import LightbulbFilledIcon from '@atlaskit/icon/glyph/lightbulb-filled';
import LoadingButton from '@atlaskit/button/loading-button';
import QuotaWarning from './QuotaWarning';
import styled from 'styled-components';
import TextArea from '@atlaskit/textarea';
import * as clientApi from '../../libs/api';

const ChatSendBox = styled.div`
  position: sticky;
  bottom: 32px;
  width: 768px;
  margin: 0 auto;
  padding-top: 16px;
  background-color: var(--ds-surface, #fafbfc);
`;

const FormBox = styled.div`
  background: #fff;
  border-radius: 3px;
  padding: 8px 16px 16px 16px;
  box-shadow: var(
    --ds-shadow-overlay,
    0 4px 8px -2px rgba(9, 30, 66, 0.25),
    0 0 1px rgba(9, 30, 66, 0.31)
  );
`;

const StyledTextArea = styled(TextArea)`
  &&:not(:focus) {
    background: none;
  }

  &&:hover:not(:read-only):not(:focus) {
    background: none;
  }

  &&:active {
    background: none;
  }

  &&:not([data-compact]) {
    padding: 0;
  }

  && {
    margin-top: 0;
    border: none;
  }
`;

const ButtonBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
`;

const ToolBtnBox = styled.span`
  opacity: 0.6;
  cursor: pointer;
  &:hover {
    opacity: 1;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  & > *:not(:last-child) {
    margin-right: 10px;
  }
`;

const MessageSender = ({ onSubmit, placeholder }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [currentPrompt, setCurrentPrompt] = React.useState('');
  const [tokenUsageRatio, setTokenUsageRatio] = React.useState('');

  const inputRef = React.useRef();
  const formRef = React.useRef();
  const handleSelect = (prompt) => {
    inputRef.current.value = prompt;
    setCurrentPrompt(prompt);
    setIsOpen(false);
    resizeTextArea();
  };

  const resizeTextArea = () => {
    inputRef.current.style.height = 'auto';
    const scrollHeight = inputRef.current.scrollHeight;
    inputRef.current.style.height = scrollHeight + 'px';
  };

  const handleInputKeyDown = (event) => {
    if (event.which === 13 && !event.shiftKey) {
      event.target.form.dispatchEvent(
        new Event('submit', { cancelable: true })
      );
    }
  };

  const handleUpload = (url) => {
    setInputValue(prev => `${prev}${url}`);
  };

  const handleSubmit = async (data, formApi) => {
    if (!data.query) return;
    setCurrentPrompt('');
    setInputValue('');
    resizeTextArea();
    await onSubmit(data.query || currentPrompt);
    formApi.reset();
    await getTokenUsageRatio();
  };

  const getTokenUsageRatio = async () => {
    const quotaData = await clientApi.queryTokenUsage();
    if (quotaData) {
      const { max_quota, quota_used } = quotaData;
      setTokenUsageRatio(quota_used / max_quota);
    }
  };

  React.useEffect(() => {
    (async () => {
      await getTokenUsageRatio();
    })();
  }, []);

  React.useEffect(() => {
    setInputValue(currentPrompt);
  }, [currentPrompt]);

  return (
    <ChatSendBox>
      <FormBox>
        <Form onSubmit={handleSubmit}>
          {({ formProps, submitting }) => (
            <form {...formProps} ref={formRef}>
              <Field name="query" defaultValue={inputValue}>
                {({ fieldProps }) => (
                  <StyledTextArea
                    ref={inputRef}
                    resize="smart"
                    onKeyDown={handleInputKeyDown}
                    placeholder={placeholder || "e.g. Write a Job Description for Senior DevOps Engineer"}
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    {...fieldProps}
                  />
                )}
              </Field>
              <ButtonBox>
                <ButtonGroup>
                  <FileUploadButton onUpload={handleUpload} />
                  <Popup
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    content={() => <PreDefinedPrompts onSelect={handleSelect} />}
                    placement="bottom-start"
                    trigger={(triggerProps) => (
                      <ToolBtnBox
                        {...triggerProps}
                        onClick={() => setIsOpen(!isOpen)}
                      >
                        <LightbulbFilledIcon label="Predefined prompts" />
                      </ToolBtnBox>
                    )}
                  />
                </ButtonGroup>
                <LoadingButton
                  type="submit"
                  appearance="primary"
                  isLoading={submitting}
                >
                  Submit
                </LoadingButton>
              </ButtonBox>
            </form>
          )}
        </Form>
      </FormBox>
      <QuotaWarning tokenUsageRatio={tokenUsageRatio} />
      <HelperMessage>
        Go to{' '}
        <a
          target="_blank"
          rel="noreferrer"
          href={`https://github.com/ZenGPT/confluence-gpt/wiki/Crafting-Effective-Prompts`}
        >
          Crafting Effective Prompts
        </a>{' '}
        for more information.
      </HelperMessage>
    </ChatSendBox>
  );
};

export default MessageSender;
