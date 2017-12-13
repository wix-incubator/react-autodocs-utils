/* global describe it expect */

const metadataParser = require('./');

describe('metadataParser', () => {
  it('should be a function', () => {
    expect(typeof metadataParser).toBe('function');
  });
});
