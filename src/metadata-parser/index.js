const readFile = require('../fs/read-file');
const parser = require('../parser');

module.exports = (path = '') =>
  readFile(path)
    .then(({source, path}) => parser(source, { currentPath: path }));
