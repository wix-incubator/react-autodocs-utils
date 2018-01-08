const babylon = require('babylon');
const recast = require('recast');


const recastParser = source =>
  recast.parse(source, {
    parser: {
      parse: () => babylon.parse(source, {
        plugins: ['jsx', 'classProperties', 'objectRestSpread'],
        sourceType: 'module'
      })
    }
  });


module.exports = recastParser;
