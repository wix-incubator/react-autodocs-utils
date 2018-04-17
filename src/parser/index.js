/* global Promise */

const followExports = require('../follow-exports');
const followProps = require('../follow-props');

const parser = ({source, path}) =>
  followExports(source, path)
    .then(({source, path: exportPath}) =>
      followProps(source, exportPath)
    );


module.exports = parser;
