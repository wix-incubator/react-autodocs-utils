const recast = require('recast');

const options = {
  tabWidth: 2,
  quote: 'single'
};

const printer = ast =>
  recast.prettyPrint(ast, options).code;

module.exports = printer;
