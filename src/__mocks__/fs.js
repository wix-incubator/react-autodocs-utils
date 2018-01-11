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

fs.lstat = (path, callback) =>
  callback(null, {
    isDirectory: () => !path.match(/\..+$/)
  });

fs.readFile = (path, encoding, callback) => {
  const file = fs.__getFile(path);

  return file
    ? callback(null, file)
    : callback(new Error(`Can't read path ${path} from mocked files`), null);
};

module.exports = fs;
