/* global Promise */
const {readFile: fsReadFileAsync, lstat} = require('fs');
const {join: pathJoin, extname: pathExtname} = require('path');

const promisify = require('../promisify');
const readFolder = require('./read-folder');

const fsReadFile = promisify(fsReadFileAsync);

const invertPromise = promise =>
  new Promise((resolve, reject) =>
    promise.then(reject).catch(resolve)
  );

const promiseFirst = promises =>
  invertPromise(Promise.all(promises.map(invertPromise)));


const isDir = path =>
  new Promise((resolve, reject) =>
    lstat(path, (err, stats) =>
      err
        ? reject(`ERROR: Unable to get file stats for ${path}, ${err}`)
        : resolve(stats.isDirectory())
    ));


const readEntryFile = path =>
  isDir(path)
    .then(isDir =>
      isDir
        ? pathJoin(path, 'index')
        : path
    )

    .then(entryPath =>
      pathExtname(entryPath)
        ? fsReadFile(path, 'utf8')
        : promiseFirst(
          ['.js', '.jsx', '.ts', '.tsx']
            .map(extension => fsReadFile(entryPath + extension, 'utf8'))
        )
    );


const readFile = (path = '') =>
  path.length
    ? readEntryFile(path)
    : Promise.reject(new Error('ERROR: Missing required `path` argument when calling `readFile`'));


module.exports = readFile;
