const fileReader = require('../file-reader');
const parser = require('../parser');

module.exports = (path = '') =>
  fileReader(path)
    .then(parser);
