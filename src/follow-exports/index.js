/* global Promise */

const path = require('path');

const recastVisit = require('../parser/recast-visit');
const readFile = require('../fs/read-file');
const resolveNodeModulesPath = require('../resolve-node-modules');
const get = require('../get');


const resolvePath = (cwd, relativePath) => {
  const desiredPath = relativePath.replace('dist/', '');

  return relativePath.startsWith('.')
    ? Promise.resolve(path.join(
      path.extname(cwd)
        ? path.dirname(cwd)
        : cwd,
      desiredPath
    ))
    : resolveNodeModulesPath(cwd, desiredPath);
};


// followExports (source: string, currentPath: string) => Promise<{source: String, exportPath: String}>
const followExports = (source, currentPath) =>
  new Promise(resolve => {
    let exportedPath = '';

    const visitExportDefault = (source, currentPath) => {
      exportedPath = '';

      recastVisit(source)({
        // export {default} from 'path';
        visitExportNamedDeclaration: function(path) {
          const isSpecifierDefault =
            path.node.specifiers.some(({ exported }) => exported.name === 'default');

          if (isSpecifierDefault) {
            exportedPath = path.node.source.value;

            return false;
          }

          this.traverse(path);
        },

        // module.exports = require('path')
        visitAssignmentExpression: function(path) {
          const getter = get(path.node);

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
        },

        // export default withClasses(Component);
        visitExportDefaultDeclaration: function(path) {
          const getter = get(path.node);

          if (getter('declaration.type') === 'CallExpression') {
            if (getter('declaration.callee.name') === 'withClasses') {
              const componentName = getter('declaration.arguments.0.name');

              recastVisit(source)({
                visitImportDeclaration: function(path) {
                  const componentImport =
                    path.node.specifiers.find(specifier => specifier.local.name === componentName);

                  if (componentImport) {
                    exportedPath = path.node.source.value;
                    return false;
                  }

                  this.traverse(path);
                }
              });
            }
          }

          this.traverse(path);
        }
      });

      if (exportedPath) {
        resolvePath(currentPath, exportedPath)
          .then(resolvedPath =>
            readFile(resolvedPath)
              .then(({ source }) => visitExportDefault(source, resolvedPath))
              .catch(e => console.log(`ERROR: unable to read ${resolvedPath}`, e))
          );
      } else {
        resolve({ source, exportPath: exportedPath || currentPath });
      }
    };

    visitExportDefault(source, currentPath);
  });


module.exports = followExports;
