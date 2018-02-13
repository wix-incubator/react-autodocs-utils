/* global Promise */

const followExports = require('../follow-exports');
const followProps = require('../follow-props');

const parser = (source, {currentPath}) =>
  followExports(source, currentPath)
    .then(({source, exportPath}) =>
      followProps(source, exportPath)
    );


module.exports = parser;
