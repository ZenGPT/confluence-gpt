// TODO: error catch
export const queryTokenUsage = async () => {
  const token = await AP.context.getToken();
  const response = await fetch(`/client/info?jwt=${token}`, {
    method: 'GET',
  });

  const result = await response.json();

  if (result) {
    return result;
  }
};

export const conversations = async (token, prompt) => {
  return fetch(`/conversations?jwt=${token}`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'next',
      messages: [
        {
          id: 'b059aadc-e7b8-4b58-9aa8-c73a855df536',
          author: {
            role: 'user',
          },
          role: 'user',
          content: {
            content_type: 'text',
            parts: [prompt],
          },
        },
      ],
      parent_message_id: 'd53b8c5b-8cc9-4d06-a164-cef3cd8571e5',
      model: 'text-davinci-002',
    }),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  });
};
