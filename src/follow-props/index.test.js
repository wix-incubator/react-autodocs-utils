/* global describe it expect */

jasmine.DEFAULT_TIMEOUT_INTERVAL = 40;
const followProps = require('./');

describe('followProps()', () => {
  it('should be a function', () => {
    expect(typeof followProps).toBe('function');
  });
});
