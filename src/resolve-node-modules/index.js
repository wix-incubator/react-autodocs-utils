const readFolder = require('../fs/read-folder');
const path = require('path');

const resolveNodeModulesPath = (cwd, modulePath) => {
  const checkPath = path.dirname(cwd);

  return readFolder(checkPath)
    .then(files =>
      files.includes('node_modules')
        ? path.join(checkPath, 'node_modules', modulePath)
        : resolveNodeModulesPath(checkPath, modulePath)
    );
};

module.exports = resolveNodeModulesPath;
