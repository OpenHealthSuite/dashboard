import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';

// extends Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Needed to keep components happy in tests
global.CSS = {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    supports: (k, v) => false,
};

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});