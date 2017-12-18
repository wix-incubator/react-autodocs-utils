/* global Promise */
const {readFile} = require('fs');
const parser = require('../parser');

module.exports = (path = '') =>
  (new Promise((resolve, reject) =>
    path.length ?
      readFile(
        path,
        'utf8',
        (err, data) => err ? reject(err) : resolve(data)
      )
      : reject(new Error('ERROR: Missing required `path` argument'))
  ))
    .then(parser);
