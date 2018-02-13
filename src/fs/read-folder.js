/* global Promise */

const {readdir} = require('fs');
const promise = require('../promises/promise');

const promiseReaddir = promise(readdir);

const readFolder = path =>
  promiseReaddir(path, 'utf8');


module.exports = readFolder;
