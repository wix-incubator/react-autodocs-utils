/* global Promise */

const {
  join: pathJoin,
  extname: pathExtname,
  dirname: pathDirname
} = require('path');

const parse = require('../parser/parse');
const visit = require('../parser/visit');
const readFile = require('../read-file');
const resolveNodeModulesPath = require('../resolve-node-modules');
const get = require('../get');


/**
  * resolvePath is used to resolve relative and/or real path to
  * node_modules
  */
// resolvePath : (cwd: string, relativePath: string) -> Promise<path: string>
const resolvePath = (cwd, relativePath) => {
  const desiredPath = relativePath.replace('dist/', '');

  return relativePath.startsWith('.')
    ? Promise.resolve(pathJoin(
      pathExtname(cwd)
        ? pathDirname(cwd)
        : cwd,
      desiredPath
    ))
    : resolveNodeModulesPath(cwd, desiredPath);
};


/**
  * extractPath is used to take exported path from source
  */
// extractPath : (source: string, path: string) -> Promise<path>
const extractPath = (source, path) =>
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

        // export const Component = withStylable(Component)
        path.traverse({
          CallExpression(path) {
            const isWithStylable = path.get('callee').isIdentifier({ name: 'withStylable' });

            if (isWithStylable) {
              const componentName = path.get('arguments')[0].node.name;

              visit(ast)({
                ImportDeclaration(path) {
                  const componentImportSpecifier =
                    path.node.specifiers.find(({ local: { name } }) => name === componentName);

                  if (componentImportSpecifier) {
                    resolve(path.node.source.value);
                    return false;
                  }
                }
              });
            }
          }
        });
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

        // TODO: refactor multiple into generic HOC resolution
        const isWithClasses = [
          path.get('declaration').isCallExpression(),
          path.get('declaration.callee').isIdentifier({ name: 'withClasses' })
        ].every(i => i);

        const componentName = isWithClasses
          ? getter('declaration.arguments.0.name')
          : getter('declaration.name');

        visit(ast)({
          ImportDeclaration(path) {
            const componentImport = path.node.specifiers.find(specifier => specifier.local.name === componentName);

            if (componentImport) {
              resolve(path.node.source.value);
            }
          }
        });
      }
    });

    // when unable to extract path, we assume that there's no more export and
    // current source is what we should parse for props
    resolve(null);
  });


// followExports (source: string, path: string) => Promise<{source: String, path: String}>
const followExports = (source, path = '') =>
  extractPath(source, path)
    .then(extractedPath =>
      extractedPath
        ? resolvePath(path, extractedPath)
          .then(resolvedPath =>
            readFile(resolvedPath)
              .then(({ source, path }) => followExports(source, path))
              .catch(e => console.log(`ERROR: unable to read ${resolvedPath}`, e))
          )
        : ({ source, path })
    );


module.exports = followExports;
