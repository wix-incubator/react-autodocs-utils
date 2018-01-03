/* global jest */
const fs = jest.genMockFromModule('fs');
const pathResolve = require('path').resolve;

let mockFiles = {};
let cwd = '';

fs.__setCwd = path =>
  cwd = path;

fs.__setFile = path => content =>
  mockFiles[path] = content;

fs.__getFile = path =>
  mockFiles[path];

fs.__reset = () =>
  mockFiles = {};

fs.__getAll = () =>
  mockFiles;

fs.lstat = (path, callback) =>
  callback(null, {
    isDirectory: () => !path.match(/\..+$/)
  });

const log = (...msgs) => fn => {
  console.log(...msgs);
  return fn;
};

fs.readFile = (path, encoding, callback) => {
  const file = fs.__getFile(path);

  return file
    ? callback(null, file)
    : callback(new Error(`Can't read path ${path} from mocked files`), null);
};


module.exports = fs;
