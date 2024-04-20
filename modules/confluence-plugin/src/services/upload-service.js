import {
  getClientDomain,
  getCurrentUserAccountId
} from "@/utils/ContextParameters/ContextParameters";

export async function uploadImage(file) {
  if (!AP?.context) {
    console.debug('No AP.context, ignored image upload');
    return;
  }

  const formData = new FormData();
  formData.append('image', file);

  const token = await AP.context.getToken();

  const response = await fetch(`/upload-image?jwt=${token}&clientDomain=${getClientDomain()}&userAccountId=${getCurrentUserAccountId()}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    console.error('Failed to upload image');
    //TODO: track event
  } else {
    console.debug('Uploaded image:', file);
    return await response.json();
  }
}