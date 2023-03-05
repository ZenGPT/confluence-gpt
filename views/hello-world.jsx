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

const FormDefaultExample = () => (
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
      onSubmit={(data) => {
      console.log('form data', data);
      return new Promise((resolve) => setTimeout(resolve, 2000)).then(() =>
          data.username === 'error' ? { username: 'IN_USE' } : undefined,
      );
    }}
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
</div>
);

export default FormDefaultExample;
