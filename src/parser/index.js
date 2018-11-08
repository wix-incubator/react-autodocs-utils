/* global Promise */

const followExports = require('../follow-exports');
const followProps = require('../follow-props');

const parser = ({ source, path }) =>
  followExports(source, path).then(({ source, path }) => followProps({ source, path }));

module.exports = parser;
