/* global jest */

const fs = jest.genMockFromModule('fs');

let mockFiles = {};
let mockFolders = {};

fs.__setFile = path => content =>
  mockFiles[path] = content;

fs.__getFile = path =>
  mockFiles[path];

fs.__setFolder = path => content =>
  mockFolders[path] = content;

fs.__getFolder = path =>
  mockFolders[path];


fs.__reset = () => {
  mockFiles = {};
  mockFolders = {};
};

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
    : callback(new Error(`Can't read path "${path}" from mocked files`), null);
};

fs.readdir = (path, encoding, callback) => {
  const folder = fs.__getFolder(path);

  return folder
    ? callback(null, folder)
    : callback(new Error(`Can't read path "${path}" from mocked folders`), null);
};


module.exports = fs;
