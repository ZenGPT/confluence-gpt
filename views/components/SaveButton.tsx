import * as React from 'react';
import Button from '@atlaskit/button';
import * as clientApi from '../../libs/api';
const SaveButton = (props) => {

  const saveAndBack =  (aDsl,contentId, creatorId) => {
    // http request
    const result = clientApi.saveDiagram(aDsl,contentId, creatorId)
    console.log(result);
    
  };


  return (
    <Button onClick={() => saveAndBack(props.dsl, props.contentId, props.creatorId)}>Save and go back</Button>
  );
};

export default SaveButton;
