const babylon = require('babylon');

const parse = source =>
  babylon.parse(source, {
    plugins: ['decorators', 'jsx', 'typescript', 'classProperties', 'objectRestSpread'],
    sourceType: 'module'
  });

module.exports = parse;
