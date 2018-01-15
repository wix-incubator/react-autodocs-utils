/* global Promise */

const {readdir} = require('fs');

const readFolder = path =>
  new Promise((resolve, reject) => {
    readdir(path, 'utf8', (err, data) =>
      err ? reject(err) : resolve(data)
    );
  });


module.exports = readFolder;
