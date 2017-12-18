/* global jest */
const fs = jest.genMockFromModule('fs');

let mockFiles = {};

fs.__setFile = path => content =>
  mockFiles[path] = content;

fs.__getFile = path =>
  mockFiles[path];

fs.__reset = () =>
  mockFiles = {};

fs.__getAll = () =>
  mockFiles;

fs.readFile = (path, encoding, callback) =>
  mockFiles[path]
    ? callback(null, mockFiles[path])
    : new Error(`Can't read path ${path} from mocked files`);


module.exports = fs;
