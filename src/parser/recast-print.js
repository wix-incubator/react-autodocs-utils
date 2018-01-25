const recast = require('recast');


const print = ast =>
  recast.print(ast).code;


module.exports = print;
