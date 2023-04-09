export async function processStream(reader, onMessage) {
  const decoder = new TextDecoder();

  let done = false;
  let buffer = "";

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    const chunkValue = decoder.decode(value);
    console.debug("chunkValue", chunkValue);
    buffer += chunkValue;

    const lines = buffer.split("\n");
    while (lines.length > 0) {
      const line = lines.shift();

      // If it's the last line, and we're not done reading, treat it as an incomplete line.
      if (lines.length === 0 && !done) {
        buffer = line;
        break;
      }

      if (line.startsWith("data: ")) {
        const jsonString = line.replace("data: ", "");
        try {
          if (jsonString === '[DONE]') {
            console.log('Stream is DONE.');
            return;
          }
          const json = JSON.parse(jsonString);
          if (json && json.choices && json.choices[0] && json.choices[0].delta) {
            const text = json.choices[0].delta.content || "";
            onMessage(text);
          }
        } catch (e) {
          console.warn("Invalid JSON: " + jsonString);
          // If JSON is incomplete or invalid, add the line back to the buffer
          // and wait for the next chunk.
          buffer = line;
          break;
        }
      }
    }
  }
}
