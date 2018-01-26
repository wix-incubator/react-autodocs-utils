/* global jest, Promise */

const pathSep = require('path').sep;
const fs = jest.genMockFromModule('fs');

let mockFS = {};

fs.__setFS = tree =>
  mockFS = tree;

fs.lstat = (path, callback) =>
  callback(null, {
    // very naive mocking, we assume filesnames not containing dot are directories
    isDirectory: () => !path.match(/\..+$/)
  });

const getNodeInTree = tree => predicate => path =>
  new Promise((resolve, reject) => {
    const [ contents ] = path
      .split(pathSep)
      .reduce(
        ([ /* contents */, cwd ], pathPart) =>
          cwd
            ? predicate(cwd[pathPart])
              ? [ cwd[pathPart], cwd[pathPart] ]
              : [ null, cwd[pathPart] ]
            : reject(new Error(`ERROR: Trying to read non existing path "${path}" in mocked files`))
        , [ null, tree ]
      );

    return contents
      ? resolve(contents)
      : reject(new Error(`Can't read path "${path}" from mocked files`));
  });

fs.readFile = (path, encoding, callback) =>
  getNodeInTree(mockFS)(candidate => typeof candidate === 'string')(path)
    .then(source => callback(null, source))
    .catch(e => callback(e, null));


fs.readdir = (path, encoding, callback) =>
  getNodeInTree(mockFS)(candidate => candidate.toString() === '[object Object]')(path)
    .then(folder => callback(null, Object.keys(folder)))
    .catch(e => callback(e, null));


module.exports = fs;
