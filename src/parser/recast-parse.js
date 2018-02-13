const babylon = require('babylon');

const parse = source =>
  babylon.parse(source, {
    plugins: ['jsx', 'typescript', 'classProperties', 'objectRestSpread'],
    sourceType: 'module'
  });

module.exports = parse;
