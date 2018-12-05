const readFile = require('../../read-file');
const parseDriver = require('./parse-driver');
const resolvePath = require('../../resolve-path');
const path = require('path');

const followImport = async ({ cwd = '', sourcePath, exportName }) => {
  const finalPath = await resolvePath(cwd, sourcePath);
  const { source } = await readFile(finalPath);
  const ast = parseDriver(source);
  const scopedCwd = path.dirname(finalPath)
  const exportedNode = await require('./get-exported-node')({ ast, exportName, cwd: scopedCwd });
  return Object.assign(exportedNode, {ast, cwd: scopedCwd});
};

module.exports = followImport;
