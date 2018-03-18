/* global Promise */

const {readdir} = require('fs');
const { extname: pathExtname, dirname: pathDirname } = require('path');
const promise = require('../promises/promise');

const promiseReaddir = promise(readdir);

// dirname : String -> String
const dirname = path =>
  pathExtname(path)
    ? pathDirname(path)
    : path;


const readFolder = path =>
  promiseReaddir(dirname(path), 'utf8');


module.exports = readFolder;
