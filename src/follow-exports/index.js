/* global Promise */

const path = require('path');

const parse = require('../parser/parse');
const visit = require('../parser/visit');
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

      const ast = parse(source);

      visit(ast)({
        // export {default} from 'path';
        ExportNamedDeclaration(path) {
          const isSpecifierDefault =
            path.node.specifiers.some(({ exported }) => exported.name === 'default');

          if (isSpecifierDefault) {
            exportedPath = path.node.source.value;

            return false;
          }
        },

        // module.exports = require('path')
        AssignmentExpression(path) {
          const isDefaultExport = [
            path.get('left.object').isIdentifier({ name: 'module' }),
            path.get('left.property').isIdentifier({ name: 'exports' }),
            path.get('right.callee').isIdentifier({ name: 'require' }),
          ].every(i => i);

          if (isDefaultExport) {
            exportedPath = path.node.right.arguments[0].value;
          }
        },

        // export default withClasses(Component);
        ExportDefaultDeclaration(path) {
          const getter = get(path.node);

          if (path.get('declaration').isCallExpression()) {
            if (path.get('declaration.callee').isIdentifier({ name: 'withClasses' })) {
              const componentName = getter('declaration.arguments.0.name');

              visit(ast)({
                ImportDeclaration(path) {
                  const componentImport =
        path.node.specifiers.find(specifier => specifier.local.name === componentName);

                  if (componentImport) {
                    exportedPath = path.node.source.value;
                  }
                }
              });
            }
          }
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
