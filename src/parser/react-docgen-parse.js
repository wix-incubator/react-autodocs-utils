const pathExtname = require('path').extname;

const {parse} = require('react-docgen');
const typescriptParse = require('react-docgen-typescript');

const componentResolve = require('./component-resolve');

const isTypescript = path => ['.ts', '.tsx'].includes(pathExtname(path));
// const isTypescript = path => false;


const reactDocgenParse = (source, { path }) =>
  isTypescript(path)
    ? typescriptParse.parse(path)[0] || {} // react-docgen-typescript returns array, so
    : parse(source, componentResolve);


module.exports = reactDocgenParse;
