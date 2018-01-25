const recast = require('recast');

const parse = require('./recast-parse');

const visit = source =>
  visitorObject =>
    recast.visit(
      parse(source),
      visitorObject
    );


module.exports = visit;
