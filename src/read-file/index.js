/* global Promise */

const {readFile: fsReadFileAsync, lstat: fsLstat} = require('fs');
const {join: pathJoin, extname: pathExtname} = require('path');

const promise = require('../promises/promise');
const promiseFirst = require('../promises/first');

const fsReadFile = promise(fsReadFileAsync);
const lstat = promise(fsLstat);

const SUPPORTED_FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

const tryReadWithExtension = entryPath =>
  promiseFirst(
    SUPPORTED_FILE_EXTENSIONS
      .map(extension => {
        const path = entryPath + extension;

        return fsReadFile(path, 'utf8')
          .then(source => ({ source, path }));
      })
  );


const isDir = path =>
  lstat(path)
    .then(stats => stats.isDirectory())
    .catch(err =>
      Promise.reject(`ERROR: Unable to get file stats for ${path}, ${err}`)
    );

const readEntryFile = path =>
  isDir(path)
    .then(isDir =>
      isDir
        ? pathJoin(path, 'index')
        : path
    )

    .catch(isDirError =>
      tryReadWithExtension(path)
        .then(({ path }) => path)
        .catch(e =>
          new Error(`ERROR: Unable to read component entry file at "${path}". ${e} ${isDirError}`)
        )
    )

    .then(path =>
      pathExtname(path)
        ? fsReadFile(path, 'utf8').then(source => ({ source, path }))
        : tryReadWithExtension(path)
    );

// readFile -> String -> Promise<{ source: String, path: String }>
const readFile = (path = '') =>
  path.length
    ? readEntryFile(path)
    : Promise.reject(new Error('ERROR: Missing required `path` argument when calling `readFile`'));


module.exports = readFile;
