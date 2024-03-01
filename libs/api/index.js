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

export const saveDiagram = async (
  dslCode,
  contentId,
  creatorId
) => {
  const token = await AP.context.getToken();
  const response = await fetch(`/save-diagram?jwt=${token}`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dslCode: dslCode,
      contentId: contentId,
      creatorId: creatorId
    })
  });

  const result = await response.json();
  console.log("saved result:", result);
  if (result) {
    return result;
  }

};
