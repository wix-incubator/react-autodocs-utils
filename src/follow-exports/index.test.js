/* global describe it expect */

const followExports = require('./');

jest.mock('fs');
const fs = require('fs');

describe('followExports()', () => {
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

      it('should return source of resolved file without exports', () => {
        const source = 'export {default} from \'./file.js\'';
        fs.__setFS({
          'index.js': source,

          node_modules: {
            'file.js': 'export {default} from \'../nested/deep/index.js\'',
          },

          nested: {
            deep: {
              'index.js': 'export {default} from \'../sibling.js\''
            },
            'sibling.js': 'hello'
          }
        });

        return expect(followExports(source, 'node_modules')).resolves.toEqual({
          source: 'hello',
          exportPath: 'nested/sibling.js'
        });
      });
    });
  });
});
