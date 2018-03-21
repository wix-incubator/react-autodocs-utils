const pathExtname = require('path').extname;
const {parse} = require('react-docgen');
const typescriptParse = require('react-docgen-typescript');

const componentResolve = require('./component-resolve');

const ensurePropsKey = object =>
  ({ props: {}, ...object });

const isTypescript = path =>
  ['.ts', '.tsx'].includes(pathExtname(path));

const parseTypescript = path =>
  ensurePropsKey(typescriptParse.parse(path)[0] || {}); // react-docgen-typescript returns array, so

const reactDocgenParse = (source, { path }) =>
  isTypescript(path)
    ? parseTypescript(path)
    : ensurePropsKey(parse(source, componentResolve));


module.exports = reactDocgenParse;
