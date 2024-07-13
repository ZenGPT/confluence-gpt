import mermaid from 'mermaid';
import { isUrl } from "@/utils/web-utils";

const USER_PROMPT = `Based on information user provided, read the content and image(if provided), convert the information to mermaid sequence diagram in mermaid code.

- First find the only and correct Starting Node
- Words within shaped blocks or boxes are Nodes
- Words on arrow lines are Online Comments
- Do not have any special characters like quota,comma in Node Name between [ and ]
- your output in markdown code block

Example:

\`\`\`mermaid
%% TD for horizontal layout, LR for vertical. Choose same layout as original image
flowchart TD

A([Node Name with Only Alphabet]) -->|Online Comments| B[Node Name in Shaped Boxes]

\`\`\`
`;
const MAX_RETRIES = 3;

export async function retryableImageToDsl(imageUrl) {
  let dsl;
  const count = 1;
  do {
    dsl = await imageToDsl(imageUrl);
  } while(count++ < MAX_RETRIES && !(await validateMermaidDsl(dsl)));
}

export async function retryableImageToDsl2(input, image) {
  let count = 1;
  const userPrompt = isUrl(input) ? USER_PROMPT : `${USER_PROMPT}\n\nAdditional instruction:\n${input}`;
  let messages = [{role: 'user', content: [{type: 'text', text: userPrompt}]}];

  if(image) {
    messages[0].content.push({type: 'image_url', image_url: {url: image}});
  }
  if(isUrl(input)) {
    messages[0].content.push({type: 'image_url', image_url: {url: input}});
  }

  do {
    const data = await imageToDsl2(messages);

    if(!data.content) {
      messages = data.messages.concat([{role: 'assistant', content: data.answer}, 
        {role: 'user', content: `The previous answer misses code block. Please generate again.`}]);
    } else {
      const result = await validateMermaidDsl2(data.content);
      if(result.valid) {
        return data.content;
      }

      messages = data.messages.concat([{role: 'assistant', content: data.answer}, 
        {role: 'user', content: `The previous generated DSL has the following error:\n\`\`\`\n${result.error}\n\`\`\`\nPlease generate again.`}]);
    }

  } while(count++ < MAX_RETRIES);
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
    return parseAnswer(answer);
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

async function imageToDsl2(messages) {
  if (AP?.context) {
    const token = await AP.context.getToken();

    const response = await fetch(`/image-to-dsl2?jwt=${token}`, {
      method: 'POST',
      body: JSON.stringify({ messages }),
      headers: { 'Content-type': 'application/json; charset=UTF-8', },
    });

    const data = await response.json();
    if(data.error) {
      throw `Call /image-to-dsl2 error: ${data.error}`;
    }

    const content = parseAnswer(data.answer);
    return {content, answer: data.answer, messages: data.messages};
  }

  //local dev
  return {content: `sequenceDiagram
    title Here is a hard-coded example diagram
    participant A
    participant B
    participant C
    participant D
    A->>B: Normal line
    B-->>C: Dashed line
    C->>D: Open arrow
    D-->>A: Dashed open arrow
    `};
};

function parseAnswer(answer) {
  const matchResult = answer.match(/```(json|mermaid)?([\s\S]*?)```/);
  if (!matchResult) {
    console.error(`Unparsable answer:`, answer);
    return;
  }

  const content = matchResult[2];
  console.debug('Extracted content:', content);
  return content;
}

async function validateMermaidDsl(dsl) {
  try {
    await mermaid.mermaidAPI.render('any-id', dsl);
    return true;
  } catch(e) {
    console.debug('Error rendering mermaid DSL:', e);
    return false;
  }
}

async function validateMermaidDsl2(dsl) {
  try {
    await mermaid.mermaidAPI.render('any-id', dsl);
    return {valid: true};
  } catch(e) {
    console.debug('Error rendering mermaid DSL:', e);
    return {valid: false, error: e};
  }
}
