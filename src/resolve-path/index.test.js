/* global describe it expect jest */

const cista = require('cista');

const resolvePath = require('./');

describe('resolvePath', () => {
  describe('given relative path without cwd', () => {
    it('should resolve with correct path to file', () => {
      const fakeFs = cista({
        'folder/file.js': '',
      });

      return expect(resolvePath(fakeFs.dir, './folder/file.js')).resolves.toEqual(fakeFs.dir + '/folder/file.js');
    });
  });

  describe('given relative path with cwd', () => {
    it('should resolve with correct path to file', () => {
      const fakeFs = cista({
        'folder/file.js': '',
      });

      return expect(resolvePath(fakeFs.dir + '/folder', './file.js')).resolves.toEqual(fakeFs.dir + '/folder/file.js');
    });
  });

  describe('given absolute path', () => {
    it('should resolve with correct path to node_modules', () => {
      const fakeFs = cista({
        'node_modules/wix-ui-core/folder/file.js': '',
      });

      return expect(resolvePath(fakeFs.dir + '/root', 'wix-ui-core/folder/file.js')).resolves.toEqual(
        fakeFs.dir + '/node_modules/wix-ui-core/folder/file.js'
      );
    });
  });
});
