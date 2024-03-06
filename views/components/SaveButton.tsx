import * as React from 'react';
import Button from '@atlaskit/button';
import * as clientApi from '../../libs/api';
const SaveButton = (props) => {

  const saveAndBack =  (aDsl) => {
    // http request
    console.log(aDsl);
    // db save 
    props.browserWindow.AP.confluence.saveMacro({foo: 'bar'}, aDsl);
    props.browserWindow.AP.confluence.closeMacroEditor();
    
  };


  return (
    <Button onClick={() => saveAndBack(props.dsl)}>Save and go back</Button>
  );
};

export default SaveButton;
