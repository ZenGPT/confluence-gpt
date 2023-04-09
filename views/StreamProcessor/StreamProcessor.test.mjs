// processStream.test.mjs
import { processStream } from './StreamProcessor.mjs';


test('processStream handles incomplete data correctly', async () => {
  const createMockReader = () => {
    const testData = [
      'data: {"id": "chatcmpl-72vOaELB8DHU8lf4W8I6Odxv2XsGh", "object": "chat.completion.chunk", "created": 1680931640, "model": "gpt-3.5-turbo-0301", "choices": [{"delta": {"content": " where"}, "index": 0, "finish_reason": null}]}\n' +
      'data: {"id": "chatcmpl-72vOaELB8DHU8lf4W8I6Odxv2XsGh", "object": "chat.completion.chunk", "created": 1680931640, "model": "gpt-3.5-turbo-0301", "choices": [{"delta": {"content": " are"}, "index": 0, "finish_reason": null}]}\n' +
      'data: {"id": "chatcmpl-72vOaELB8DHU8lf4W8I6Odxv2XsGh"',
      ', "object": "chat.completion.chunk", "created": 1680931640, "model": "gpt-3.5-turbo-0301", "choices": [{"delta": {"content": " you"}, "index": 0, "finish_reason": null}]}\n',
    ];

    let readIndex = 0;

    return {
      read: async () => {
        if (readIndex < testData.length) {
          const value = new TextEncoder().encode(testData[readIndex]);
          readIndex += 1;
          return { value, done: false };
        } else {
          return { value: undefined, done: true };
        }
      },
    };
  };

  const mockReader = createMockReader();
  let receivedText = '';

  const messageCallback = (text) => {
    receivedText += text;
  };

  await processStream(mockReader, messageCallback);

  expect(receivedText).toBe(' where are you');
});

test('data closed with [DONE]', async () => {
  console.log('data closed with [DONE]');
  const createMockReader = () => {
    const testData = [
      'data: {"id": "chatcmpl-72vOaELB8DHU8lf4W8I6Odxv2XsGh", "object": "chat.completion.chunk", "created": 1680931640, "model": "gpt-3.5-turbo-0301", "choices": [{"delta": {"content": " where"}, "index": 0, "finish_reason": null}]}\n' +
      'data: {"id": "chatcmpl-72vOaELB8DHU8lf4W8I6Odxv2XsGh", "object": "chat.completion.chunk", "created": 1680931640, "model": "gpt-3.5-turbo-0301", "choices": [{"delta": {"content": " are"}, "index": 0, "finish_reason": null}]}\n' +
      'data: [DONE]\n',
    ];

    let readIndex = 0;

    return {
      read: async () => {
        if (readIndex < testData.length) {
          const value = new TextEncoder().encode(testData[readIndex]);
          readIndex += 1;
          return { value, done: false };
        } else {
          return { value: undefined, done: true };
        }
      },
    };
  };


  const mockReader = createMockReader();
  let receivedText = '';

  const messageCallback = (text) => {
    receivedText += text;
  };

  await processStream(mockReader, messageCallback);

  expect(receivedText).toBe(' where are');
});
