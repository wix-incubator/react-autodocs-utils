/* global describe it expect jest */

jest.mock('fs');
const fs = require('fs');

const readFolder = require('./');

describe('readFolder', () => {
  describe('given path to folder', () => {
    it('should resolve with array of filenames', () => {
      fs.__setFS({
        'folder-name': {
          'file.js': '',
          folder: {},
        },
      });

      return expect(readFolder('folder-name')).resolves.toEqual(['file.js', 'folder']);
    });
  });

  describe('given path to file', () => {
    it('should should resolve with array of filename', () => {
      fs.__setFS({
        folder: {
          'index.js': '',
          'some-file': '',
          another_folder: {},
        },
      });

      return expect(readFolder('folder/index.js')).resolves.toEqual(['index.js', 'some-file', 'another_folder']);
    });
  });

  describe('given non existing path', () => {
    it('should reject promise', () => expect(readFolder('you-dont-exist')).rejects.toBeDefined());
  });
});
