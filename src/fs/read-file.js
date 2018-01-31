/* global Promise */

const {readFile: fsReadFileAsync, lstat} = require('fs');
const {join: pathJoin, extname: pathExtname} = require('path');

const promisify = require('../promises/promisify');
const promiseFirst = require('../promises/first');

const fsReadFile = promisify(fsReadFileAsync);

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
