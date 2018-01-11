const fileReader = require('../fs/read-file');
const parser = require('../parser');

module.exports = (path = '') =>
  fileReader(path)
    .then(source => parser(source, { currentPath: path }));
