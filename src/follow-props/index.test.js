/* global describe it expect */

const followProps = require('./');

// yes this is very empty
// this function was extracted from `metadataParser` which
// has the functionality of `followProps` tested over there.
// although yes, it should also be tested separately, TODO

describe('followProps()', () => {
  it('should be a function', () => {
    expect(typeof followProps).toBe('function');
  });
});
