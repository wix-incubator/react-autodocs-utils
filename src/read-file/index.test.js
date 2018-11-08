/* global describe it expect jest */

jest.mock('fs');
const fs = require('fs');

const readFile = require('./');

describe('readFile', () => {
  describe('given existing path', () => {
    it('should resolve with file content', () => {
      const content = 'hello file content';
      fs.__setFS({
        'test.file': content,
      });

      return expect(readFile('test.file')).resolves.toEqual({
        source: content,
        path: 'test.file',
        isTypescript: false,
      });
    });

    it('should resolve with correct isTypescript flag', () => {
      const jsFiles = ['index.js', 'index.jsx'];
      const tsFiles = ['index.ts', 'index.tsx', 'index.d.ts'];
      const allFiles = [...jsFiles, ...tsFiles];

      fs.__setFS(allFiles.reduce((acc, path) => ({ ...acc, [path]: ' ' }), {}));

      const expectFlag = isTypescript => files => files.map(() => expect.objectContaining({ isTypescript }));

      return expect(Promise.all(allFiles.map(readFile))).resolves.toEqual([
        ...expectFlag(false)(jsFiles),
        ...expectFlag(true)(tsFiles),
      ]);
    });
  });

  describe('given non existing path', () => {
    it('should reject with error', () => expect(readFile('you-dont-exist')).rejects.toBeDefined());
  });
});
