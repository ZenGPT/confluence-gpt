import React, { useState, useRef } from 'react';
import { IconButton } from '@atlaskit/button/new';
import ImageIcon from '@atlaskit/icon/glyph/image';
import Spinner from '@atlaskit/spinner';

const FileUploadButton = ({ onUpload }) => {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (event) => {
    setIsLoading(true);

    const file = event.target.files[0];
    if (!file) {
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = await AP.context.getToken();
      const response = await fetch(`/upload-image?jwt=${token}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      console.log('Image uploaded:', data.imageUrl);
      onUpload(data.imageUrl);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current && fileInputRef.current.click();
  };

  return (
    <>
      {isLoading ? (
        <Spinner size="medium" />
      ) : (
        <IconButton icon={ImageIcon} onClick={handleClick} label="Upload Image" />
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        style={{ display: 'none' }}
        accept="image/jpeg,image/png"
      />
    </>
  );
};

export default FileUploadButton;