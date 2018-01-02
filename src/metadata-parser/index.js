const fileReader = require('../file-reader');
const parser = require('../parser');

module.exports = (path = '') =>
  fileReader(path)
    .then(source => parser(source, { cwd: path }));
