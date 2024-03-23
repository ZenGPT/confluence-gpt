import React, { useState, useRef } from 'react';
import { IconButton } from '@atlaskit/button/new';
import ImageIcon from '@atlaskit/icon/glyph/image';

function ImageUploadAndPreview({ onImageSelected, onRemove, showPreview }) {
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);
  
    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (!file) {
        return;
      }
  
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        onImageSelected(file);
      };
      reader.readAsDataURL(file);
    };
  
    const handleClick = () => {
      fileInputRef.current.click();
    };
  
    const handleRemoveClick = () => {
      setPreviewUrl(null);
      onRemove();
      if (fileInputRef.current) { // Clear the file input when click on remove, this will allow to select the same file again
        fileInputRef.current.value = '';
      }
    };
  
    return (
      <div>
        <IconButton
          icon={ImageIcon}
          onClick={handleClick}
          label="Upload Image"
        />
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleImageChange}
          accept="image/*"
          style={{ display: 'none' }}
        />
        {showPreview && previewUrl && (
          <div>
            <img src={previewUrl} alt="Preview" style={{ width: 200, height: 200 }} onClick={handleRemoveClick}/>
          </div>
        )}
      </div>
    );
  }  

export default ImageUploadAndPreview;
