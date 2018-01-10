const recast = require('recast');

const parser = require('./recast-parser');

const visitor = source =>
  recastVisitor =>
    recast.visit(
      parser(source),
      recastVisitor
    );


module.exports = visitor;
