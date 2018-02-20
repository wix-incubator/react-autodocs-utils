/* global Promise */

const path = require('path');

const parse = require('../parser/parse');
const visit = require('../parser/visit');
const readFile = require('../read-file');
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


// extractPath : (source: string) -> Promise<path>
const extractPath = source =>
  new Promise(resolve => {
    const ast = parse(source);

    visit(ast)({
      // export {default} from 'path';
      ExportNamedDeclaration(path) {
        const isSpecifierDefault =
          path.node.specifiers.some(({ exported }) => exported.name === 'default');

        if (isSpecifierDefault) {
          resolve(path.node.source.value);

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
          resolve(path.node.right.arguments[0].value);
        }
      },

      // export default withClasses(Component);
      ExportDefaultDeclaration(path) {
        const getter = get(path.node);

        const isNeedle = [
          path.get('declaration').isCallExpression(),
          path.get('declaration.callee').isIdentifier({ name: 'withClasses' })
        ].every(i => i);

        if (isNeedle) {
          const componentName = getter('declaration.arguments.0.name');

          visit(ast)({
            ImportDeclaration(path) {
              const componentImport = path.node.specifiers.find(specifier => specifier.local.name === componentName);

              if (componentImport) {
                resolve(path.node.source.value);
              }
            }
          });
        }
      }
    });

    // when unable to extract path, we assume that there's no more export and
    // current source is what we should parse for props
    resolve(null);
  });


// followExports (source: string, currentPath: string) => Promise<{source: String, exportPath: String}>
const followExports = (source, currentPath) =>
  extractPath(source, currentPath)
    .then(extractedPath =>
      extractedPath
        ? resolvePath(currentPath, extractedPath)
          .then(resolvedPath =>
            readFile(resolvedPath)
              .then(({ source }) => followExports(source, resolvedPath))
              .catch(e => console.log(`ERROR: unable to read ${resolvedPath}`, e))
          )
        : ({ source, path: extractedPath || currentPath })
    );


module.exports = followExports;
