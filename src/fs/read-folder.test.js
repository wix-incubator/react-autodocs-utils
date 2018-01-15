/* global describe it expect jest */

jest.mock('fs');
const fs = require('fs');

const readFolder = require('./read-folder');

describe('readFolder', () => {
  describe('given existing path', () => {
    it('should resolve with array of folder entries', () => {
      const mockFolder = ['file.js', 'folder'];
      fs.__setFolder('folder-name')(mockFolder);

      return expect(readFolder('folder-name')).resolves.toEqual(mockFolder);
    });
  });

  describe('given non existing path', () => {
    it('should reject promise', () =>
      expect(readFolder('you-dont-exist')).rejects.toBeDefined()
    );
  });
});
