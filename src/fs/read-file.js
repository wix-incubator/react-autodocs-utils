/* global Promise */
const {readFile: fsReadFile, lstat} = require('fs');
const pathJoin = require('path').join;


const isDir = path =>
  new Promise((resolve, reject) =>
    lstat(path, (err, stats) =>
      err
        ? reject(`ERROR: Unable to get stats for ${path}, ${err}`)
        : resolve(stats.isDirectory())
    )
  );


const readEntryFile = path =>
  isDir(path)
    .then(isDir =>
      new Promise((resolve, reject) =>
        fsReadFile(
          isDir ? pathJoin(path, 'index.js') : path,
          'utf8',
          (err, data) => err ? reject(err) : resolve(data)
        )
      )
    )
    .catch(e =>
      // naively try again with extension
      // TODO: obviously it shouldn't be so stupid
      !path.endsWith('.js')
        ?  readEntryFile(path + '.js')
        : Promise.reject(e)
    );


const readFile = (path = '') =>
  path.length
    ? readEntryFile(path)
    : Promise.reject(new Error('ERROR: Missing required `path` argument when calling `readFile`'));


module.exports = readFile;
