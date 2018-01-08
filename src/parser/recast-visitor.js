const babylon = require('babylon');
const recast = require('recast');


const parser = source =>
  recast.parse(source, {
    parser: {
      parse: () => babylon.parse(source, {
        plugins: ['jsx', 'classProperties', 'objectRestSpread'],
        sourceType: 'module'
      })
    }
  });


const visitor = source =>
  recastVisitor =>
    recast.visit(
      parser(source),
      recastVisitor
    );


module.exports = visitor;
