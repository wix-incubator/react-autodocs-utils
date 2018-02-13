/* global describe it expect */

const followExports = require('./');

jest.mock('fs');
const fs = require('fs');

describe('followExports()', () => {
  it('should be a function', () => {
    expect(typeof followExports).toBe('function');
  });

  describe('given source', () => {
    describe('which does not have exports', () => {
      it('should return original source', () => {
        const source = 'const hey = "now"';

        return expect(followExports(source)).resolves.toEqual({ source });
      });
    });

    describe('which has module.exports', () => {
      it('should return source of that export', () => {
        const source = 'module.exports = require(\'./index.js\')';

        fs.__setFS({
          'index.js': 'hello'
        });

        return expect(followExports(source, '')).resolves.toEqual({
          source: 'hello',
          exportPath: 'index.js'
        });
      });
    });
  });
});
