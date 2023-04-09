export const createMockReader = (data) => {
  let readIndex = 0;
  const textEncoder = new TextEncoder();
  return {
    // The test data will be sent one record per read
    read: async () => {
      if (readIndex < data.length) {
        const value = textEncoder.encode(data[readIndex]);
        readIndex += 1;
        return { value, done: false };
      } else {
        return { value: undefined, done: true };
      }
    },
  };
};
