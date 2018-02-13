/* global Promise */

const reactDocgenParse = require('./react-docgen-parse');
const followExports = require('../follow-exports');
const followProps = require('../follow-props');

const parser = (source, {currentPath}) =>
  followExports(source, currentPath)
    .then(({source, exportPath}) => {
      const parsed = reactDocgenParse(source, { path: exportPath });

      return parsed.composes
        ? followProps(parsed, exportPath)
        : Promise.resolve(parsed);
    });


module.exports = parser;
