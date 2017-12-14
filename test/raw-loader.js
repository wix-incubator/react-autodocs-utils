/* global Promise */

const {readFile} = require('fs');
const {resolve: resolvePath} = require('path');

module.exports = dirname => path =>
  new Promise((resolve, reject) =>
    readFile(
      resolvePath(dirname, path),
      'utf8',
      (err, data) => (err ? reject(err) : resolve(data))
    )
  );
