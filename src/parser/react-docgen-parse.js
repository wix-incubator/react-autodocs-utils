const {parse} = require('react-docgen');
const componentResolve = require('./component-resolve');

module.exports = source =>
  parse(source, componentResolve);
