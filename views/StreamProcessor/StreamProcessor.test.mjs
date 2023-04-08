// processStream.test.js
import { processStream } from './StreamProcessor';

// A mock ReadableStreamDefaultReader for testing
class MockReader {
  constructor(chunks) {
    this.chunks = chunks;
    this.index = 0;
  }

  async read() {
    if (this.index < this.chunks.length) {
      return { value: this.chunks[this.index++], done: false };
    } else {
      return { value: undefined, done: true };
    }
  }
}

describe('processStream1', function () {
  it('processStream receives messages correctly', async () => {
    // Test data
    const streamData = [
      "data: {\"id\": \"chatcmpl-72vOaELB8DHU8lf4W8I6Odxv2XsGh\", \"object\": \"chat.completion.chunk\", \"created\": 1680931640, \"model\": \"gpt-3.5-turbo-0301\", \"choices\": [{\"delta\": {\"content\": \" idea\"}, \"index\": 0, \"finish_reason\": null}]}\n",
      "data: {\"id\": \"chatcmpl-72vOaELB8DHU8lf4W8I6Odxv2XsGh\", \"object\": \"chat.completion.chunk\", \"created\": 1680931640, \"model\": \"gpt-3.5-turbo-0301\", \"choices\": [{\"delta\": {\"content\": \" of\"}, \"index\": 0, \"finish_reason\": null}]}\n",
      "data: {\"id\": \"chatcmpl-72vOaELB8DHU8lf4W8I6Odxv2XsGh\", \"object\": \"chat.completion.chunk\", \"created\": 1680931640, \"model\": \"gpt-3.5-turbo-0301\", \"choices\": [{\"delta\": {\"content\": \" the\"}, \"index\": 0, \"finish_reason\": null}]}\n",
      "data: {\"id\": \"chatcmpl-72vOaELB8DHU8lf4W8I6Odxv2XsGh\", \"object\": \"chat.completion.chunk\", \"created\": 1680931640, \"model\": \"gpt-3.5-turbo-0301\", \"choices\": [{\"delta\": {\"content\": \" main\"}, \"index\": 0, \"finish_reason\": null}]}\n",
    ];

    // Create the mock reader with test data
    const reader = new MockReader(streamData.map((chunk) => new TextEncoder().encode(chunk)));

    // Initialize an empty array to store the received messages
    const messages = [];

    // Call the processStream function with the mock reader and a callback to store received messages
    await processStream(reader, (message) => {
      messages.push(message);
    });

    // Verify that the expected messages were received
    const expectedMessages = [" idea", " of", " the", " main"];
    expect(messages).toEqual(expectedMessages);
  })
});

