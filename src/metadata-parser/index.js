/* global Promise */
const {readFile} = require('fs');
const path = require('path');

module.exports = (filePath = '') =>
  new Promise((resolve, reject) =>
    filePath.length ?
      readFile(
        path.resolve(__dirname, filePath),
        'utf8',
        (err, data) => (err ? reject(err) : resolve(data))
      )
      : reject(new Error('ERROR: Missing required `path` argument'))
  );
