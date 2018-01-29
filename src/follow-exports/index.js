/* global Promise */

const path = require('path');

const recastVisit = require('../parser/recast-visit');
const fileReader = require('../fs/read-file');
const get = require('../get');


const resolvePath = (cwd, relativePath) => {
  const resolved = relativePath.startsWith('.')
    ? path.join(
      path.extname(cwd)
        ? path.dirname(cwd)
        : cwd,
      relativePath
    )
    : path.join('node_modules', relativePath);

  const desired = resolved.replace('dist/', '');

  return desired;
};


// followExports (source: string, currentPath: string) => Promise<{source: String, exportPath: String}>
const followExports = (source, currentPath) =>
  new Promise(resolve => {
    let exportedPath = '';

    const visitExportDefault = (source, currentPath) => {
      exportedPath = '';

      recastVisit(source)({
        visitExportNamedDeclaration: function(path) {
          const isSpecifierDefault =
            path.node.specifiers.some(({ exported }) => exported.name === 'default');

          if (isSpecifierDefault) {
            exportedPath = path.node.source.value;

            return false;
          }

          this.traverse(path);
        },

        visitAssignmentExpression: function(path) {
          const node = path.node;
          const getter = get(node);

          const isDefaultExport = [
            getter('left.object.name') === 'module',
            getter('left.property.name') === 'exports',
            getter('right.callee.name') === 'require',
          ].every(i => i);

          if (isDefaultExport) {
            exportedPath = getter('right.arguments.0.value');

            return false;
          }

          this.traverse(path);
        }
      });

      if (exportedPath) {
        const resolvedPath = resolvePath(currentPath, exportedPath);

        fileReader(resolvedPath)
          .then(source => visitExportDefault(source, resolvedPath))
          .catch(e => console.log(`ERROR: unable to read ${resolvedPath}`, e));
      } else {
        resolve({ source, exportPath: exportedPath || currentPath });
      }
    };

    visitExportDefault(source, currentPath);
  });


module.exports = followExports;
