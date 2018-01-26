/* global describe it expect jest */

jest.mock('fs');
const fs = require('fs');

const readFolder = require('./read-folder');

describe('readFolder', () => {
  describe('given existing path', () => {
    it('should resolve with array of folder entries', () => {
      fs.__setFS({
        'folder-name': {
          'file.js': '',
          folder: {}
        }
      });

      return expect(readFolder('folder-name')).resolves.toEqual(['file.js', 'folder']);
    });
  });

  describe('given non existing path', () => {
    it('should reject promise', () =>
      expect(readFolder('you-dont-exist')).rejects.toBeDefined()
    );
  });
});
