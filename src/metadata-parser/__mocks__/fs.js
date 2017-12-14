/* global jest */
const fs = jest.genMockFromModule('fs');

const mockFiles = {};

fs.__setFile = path => content =>
  mockFiles[path] = content;

fs.readFile = (path, encoding, callback) =>
  mockFiles[path]
    ? callback(null, mockFiles[path])
    : new Error(`Can't read path ${path} from mocked files`);


module.exports = fs;
