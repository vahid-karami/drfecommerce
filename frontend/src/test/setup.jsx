import { expect } from 'vitest';
import '@testing-library/jest-dom';

expect.extend({
  toBeInTheDocument: (element) => {
    const pass = element && element.ownerDocument && element.ownerDocument.body.contains(element);
    return {
      pass,
      message: () => `expected element to ${pass ? 'not ' : ''}be in the document`,
    };
  },
});
