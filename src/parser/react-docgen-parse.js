const pathExtname = require('path').extname;
const javascriptParser = require('react-docgen');
const typescriptParser = require('react-docgen-typescript');

const componentResolve = require('./component-resolve');

const ensurePropsKey = object =>
  ({ props: {}, ...object });

const isTypescript = path =>
  ['.ts', '.tsx'].includes(pathExtname(path));

const parseTypescript = path =>
  ensurePropsKey(typescriptParser.parse(path)[0] || {}); // react-docgen-typescript returns array, so

const parseJavascript = source => {
  let parsed;

  try {
    parsed = javascriptParser.parse(source, componentResolve);
  } catch (e) {
    parsed = {};
  }

  return ensurePropsKey(parsed);
};

const reactDocgenParse = (source, { path }) =>
  isTypescript(path)
    ? parseTypescript(path)
    : parseJavascript(source);


module.exports = reactDocgenParse;
