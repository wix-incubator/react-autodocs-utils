const {parse} = require('react-docgen');
const componentResolver = require('./component-resolver');

module.exports = source =>
  parse(source, componentResolver);
