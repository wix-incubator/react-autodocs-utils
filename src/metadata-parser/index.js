const readFile = require('../read-file');
const parser = require('../parser');

module.exports = (path = '') =>
  readFile(path)
    .then(({source, path}) => parser(source, path));
