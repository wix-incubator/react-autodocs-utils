/* global Promise */

const {readFile: fsReadFileAsync, lstat} = require('fs');
const {join: pathJoin, extname: pathExtname} = require('path');

const promisify = require('../promises/promisify');
const promiseFirst = require('../promises/first');

const fsReadFile = promisify(fsReadFileAsync);

const SUPPORTED_FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];


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
          SUPPORTED_FILE_EXTENSIONS
            .map(extension => fsReadFile(entryPath + extension, 'utf8'))
        )
    );


const readFile = (path = '') =>
  path.length
    ? readEntryFile(path)
    : Promise.reject(new Error('ERROR: Missing required `path` argument when calling `readFile`'));


module.exports = readFile;
