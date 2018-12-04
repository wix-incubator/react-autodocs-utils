/* global describe it expect jest */

jest.mock('fs');
const fs = require('fs');

const resolvePath = require('./');

describe('resolvePath', () => {
  describe('given relative path without cwd', () => {
    it('should resolve with correct path to file', () => {
      fs.__setFS({
        folder: {
          'file.js': ''
        },
      });

      return expect(resolvePath('','./folder/file.js')).resolves.toEqual('folder/file.js');
    });
  });

  describe('given relative path with cwd', () => {
    it('should resolve with correct path to file', () => {
      fs.__setFS({
        folder: {
          'file.js': ''
        },
      });

      return expect(resolvePath('folder','./file.js')).resolves.toEqual('folder/file.js');
    });
  });

  describe('given absolute path', () => {
    it('should resolve with correct path to node_modules', () => {
      fs.__setFS({
        node_modules: {
          'wix-ui-core': {
            folder: {
              'file.js': ''
            },
          }
        }
      });

      return expect(resolvePath('','wix-ui-core/folder/file.js'))
        .resolves.toEqual('node_modules/wix-ui-core/folder/file.js');
    });
  });
});
