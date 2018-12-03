const readFile = require('../../read-file');
const parseDriver = require('./parse-driver');
const path = require('path');
const resolveNodeModulesPath = require('../../resolve-node-modules');

const followImport = async ({ cwd = '', sourcePath, exportName }) => {
  const isRelativePath = sourcePath.startsWith('.')
  const finalPath = !isRelativePath 
    ? await resolveNodeModulesPath(cwd, sourcePath) 
    : cwd ? path.join(cwd, sourcePath) : sourcePath
  const { source } = await readFile(finalPath);
  const ast = parseDriver(source);
  return require('./get-exported-node')({ ast, exportName, cwd });
};

module.exports = followImport;
