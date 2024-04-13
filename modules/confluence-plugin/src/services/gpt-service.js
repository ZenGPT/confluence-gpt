import mermaid from 'mermaid';

const MAX_RETRIES = 3;

export async function retryableImageToDsl(imageUrl) {
  let dsl;
  const count = 1;
  do {
    dsl = await imageToDsl(imageUrl);
  } while(count++ < MAX_RETRIES && !(await validateMermaidDsl(dsl)));
}

async function imageToDsl(imageUrl) {
  if (AP?.context) {
    const token = await AP.context.getToken();

    const response = await fetch(`/image-to-dsl?jwt=${token}`, {
      method: 'POST',
      body: JSON.stringify({ imageUrl }),
      headers: { 'Content-type': 'application/json; charset=UTF-8', },
    });

    const answer = await response.json();

    const matchResult = answer.match(/```(json|mermaid)?([\s\S]*?)```/);
    if (!matchResult) {
      console.error(`Unparsable GPT answer:`, answer);
    }

    const content = matchResult && matchResult[2];
    console.debug('Extracted content:', content);
    return content;
  }

  //local dev
  return `sequenceDiagram
    title Here is a generation for ${imageUrl.startsWith('data:image') ? 'uploaded image' : imageUrl}
    participant A
    participant B
    participant C
    participant D
    A->>B: Normal line
    B-->>C: Dashed line
    C->>D: Open arrow
    D-->>A: Dashed open arrow
    `;
};

async function validateMermaidDsl(dsl) {
  try {
    await mermaid.mermaidAPI.render('any-id', dsl);
    return true;
  } catch(e) {
    console.debug('Error rendering mermaid DSL:', e);
    return false;
  }
}
