const readFile = require('../../read-file');
const parseDriver = require('./parse-driver');
const path = require('path');

const followImport = async ({ cwd, sourcePath, exportName }) => {
  const { source } = await readFile(cwd ? path.join(cwd, sourcePath) : sourcePath);
  const ast = parseDriver(source);
  return require('./get-exported-node')({ ast, exportName, cwd });
};

module.exports = followImport;
