import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';

const origError = console.error;
console.error = (...args: unknown[]) => {
  const first = args[0];
  if (typeof first === 'string' && first.includes('not wrapped in act')) return;
  origError(...args);
};
