// a single message in a conversation
export interface Chat {
  id: string;
  type: 'user' | 'gpt';
  message: string;
  loading: boolean;
  error?: Error;
}
