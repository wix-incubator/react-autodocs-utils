const {parse} = require('react-docgen');
const typescriptParse = require('react-docgen-typescript');

const componentResolve = require('./component-resolve');

const reactDocgenParse = (source, { path, isTypescript }) =>
  isTypescript
    ? typescriptParse.parse(path)[0] || {} // react-docgen-typescript returns array, so
    : parse(source, componentResolve);


module.exports  = reactDocgenParse;
