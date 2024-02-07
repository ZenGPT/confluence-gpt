// TODO: error catch
export const queryTokenUsage = async () => {
  const token = await AP.context.getToken();
  const response = await fetch(`/v2/client/info?jwt=${token}`, {
    method: 'GET',
  });

  const result = await response.json();

  if (result) {
    return result;
  }
};
