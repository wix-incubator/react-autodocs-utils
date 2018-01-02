/* global jest */
const fs = jest.genMockFromModule('fs');
const pathResolve = require('path').resolve;

let mockFiles = {};
let cwd = '';

fs.__setCwd = path =>
  cwd = path;

fs.__setFile = path => content =>
  mockFiles[pathResolve(cwd, path)] = content;

fs.__getFile = path =>
  mockFiles[pathResolve(cwd, path)];

fs.__reset = () =>
  mockFiles = {};

fs.__getAll = () =>
  mockFiles;

fs.readFile = (path, encoding, callback) => {
  console.log(mockFiles);
  const file = fs.__getFile(path);

  return file
    ? callback(null, file)
    : callback(new Error(`Can't read path ${path} from mocked files`), null);
};


module.exports = fs;
