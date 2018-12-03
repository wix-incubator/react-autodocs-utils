const readFile = require('../../read-file');
const parseDriver = require('./parse-driver');
const resolvePath = require('../../resolve-path');

const followImport = async ({ cwd = '', sourcePath, exportName }) => {
  const finalPath = await resolvePath(cwd, sourcePath);
  const { source } = await readFile(finalPath);
  const ast = parseDriver(source);
  const exportedNode = await require('./get-exported-node')({ ast, exportName, cwd });
  return Object.assign(exportedNode, {ast});
};

module.exports = followImport;
