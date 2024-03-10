import * as React from 'react';
import Button from '@atlaskit/button';
import * as clientApi from '../../libs/api';

const SaveButton = (props) => {
	const spaceKey = props.spaceKey;
  const saveAndBack =  (aDsl) => {
		props.browserWindow.AP.request({
      url: '/rest/api/content',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
          "type": 'ac:gptdock-confluence:gpt-custom-content-key',
          "space": {
              "key": `${spaceKey}`
          },
          "title": "title-test-test",
          "body": {
            "raw": {
              "value": JSON.stringify({"dsl":aDsl}),
              "representation": "raw"
            }
          },
      }),
      success: (data) => {
          console.log("data:" + JSON.parse(data).id);
					props.browserWindow.AP.confluence.saveMacro({"contentId": JSON.parse(data).id, "updatedAt": new Date() }, aDsl);
					props.browserWindow.AP.dialog.close();
      },
      error: (err) => {
          console.error(err);
      }
    });

    
  };


  return (
    <Button onClick={() => saveAndBack(props.dsl)}>Save and go back</Button>
  );
};

export default SaveButton;
