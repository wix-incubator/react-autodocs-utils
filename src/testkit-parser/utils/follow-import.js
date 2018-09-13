const readFile = require('../../read-file');
const path = require('path');

const followImport = async ({ cwd, sourcePath, exportName  }) => {
  const { source } = await readFile(cwd ? path.join(cwd, sourcePath) : sourcePath);
  return require('../get-export')(source, exportName, cwd);
};

module.exports = followImport;