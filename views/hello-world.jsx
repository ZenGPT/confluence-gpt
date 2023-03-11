import React, { Fragment } from 'react';

import ButtonGroup from '@atlaskit/button/button-group';
import LoadingButton from '@atlaskit/button/loading-button';
import Button from '@atlaskit/button/standard-button';
import { Checkbox } from '@atlaskit/checkbox';
import TextField from '@atlaskit/textfield';

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
  const [messages, setMessages] = React.useState([]);
  let onSubmit = async (data) => {
    // try fetch data from server, if error, set error message, if success, set success message
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'foo',
          body: 'bar',
          userId: 1,
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      });
      const respJson = await response.json();
      console.log('data', respJson);
      console.log('setMessages', respJson.body);
      setMessages(respJson.body);
    } catch (e) {
      console.log('setMessages', 'error');
      setMessages('An error occurred, please try again later.');
    }
    console.log('form data', data);
  };
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
      <Form
      onSubmit={onSubmit}
      >
      {({ formProps, submitting }) => (
          <form {...formProps}>
            <FormHeader
                title="Queries"
            />
            <FormSection>
              <Field label="Enter your request here:" name="example-text">
                {({ fieldProps }) => (
                    <Fragment>
                      <TextArea
                          placeholder="e.g. Write a Job Description for Senior DevOps Engineer"
                          {...fieldProps}
                      />
                      <HelperMessage>
                        Go to <a href={`https://www.zengpt.com/how-to-ask-questions`}>How to ask questions</a> for more information.
                      </HelperMessage>
                    </Fragment>
                )}
              </Field>
            </FormSection>

            <FormFooter>
              <ButtonGroup>
                <LoadingButton
                    type="submit"
                    appearance="primary"
                    isLoading={submitting}
                >
                  Submit
                </LoadingButton>
              </ButtonGroup>
            </FormFooter>
          </form>
      )}
    </Form>
    message: {messages}
</div>
)};

export default FormDefaultExample;
