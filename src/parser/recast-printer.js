const recast = require('recast');

const printer = ast =>
  recast.print(ast).code;

module.exports = printer;
