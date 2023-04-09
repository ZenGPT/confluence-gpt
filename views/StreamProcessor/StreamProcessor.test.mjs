// processStream.test.mjs
import {processStream} from './StreamProcessor.mjs';
import {createMockReader} from './MockReader.mjs';

test('processStream handles incomplete data correctly', async () => {
  const testData = [
    'data: {"id": "chatcmpl-72vOaELB8DHU8lf4W8I6Odxv2XsGh", "object": "chat.completion.chunk", "created": 1680931640, "model": "gpt-3.5-turbo-0301", "choices": [{"delta": {"content": " where"}, "index": 0, "finish_reason": null}]}\n' +
    'data: {"id": "chatcmpl-72vOaELB8DHU8lf4W8I6Odxv2XsGh", "object": "chat.completion.chunk", "created": 1680931640, "model": "gpt-3.5-turbo-0301", "choices": [{"delta": {"content": " are"}, "index": 0, "finish_reason": null}]}\n' +
    'data: {"id": "chatcmpl-72vOaELB8DHU8lf4W8I6Odxv2XsGh"',
    ', "object": "chat.completion.chunk", "created": 1680931640, "model": "gpt-3.5-turbo-0301", "choices": [{"delta": {"content": " you"}, "index": 0, "finish_reason": null}]}\n',
  ];

  const mockReader = createMockReader(testData);
  let receivedText = '';

  const messageCallback = (text) => {
    receivedText += text;
  };

  await processStream(mockReader, messageCallback);

  expect(receivedText).toBe(' where are you');
});

test('data closed with [DONE]', async () => {
  const testData = [
    'data: {"id": "chatcmpl-72vOaELB8DHU8lf4W8I6Odxv2XsGh", "object": "chat.completion.chunk", "created": 1680931640, "model": "gpt-3.5-turbo-0301", "choices": [{"delta": {"content": " where"}, "index": 0, "finish_reason": null}]}\n' +
    'data: {"id": "chatcmpl-72vOaELB8DHU8lf4W8I6Odxv2XsGh", "object": "chat.completion.chunk", "created": 1680931640, "model": "gpt-3.5-turbo-0301", "choices": [{"delta": {"content": " are"}, "index": 0, "finish_reason": null}]}\n' +
    'data: [DONE]\n',
  ];

  const mockReader = createMockReader(testData);
  let receivedText = '';

  const messageCallback = (text) => {
    receivedText += text;
  };

  await processStream(mockReader, messageCallback);

  expect(receivedText).toBe(' where are');
});
