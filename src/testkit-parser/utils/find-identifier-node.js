const types = require('@babel/types');
const visit = require('../../parser/visit');
const readFile = require('../../read-file');
const path = require('path');

const findNodeOrImport = ({ ast, name }) => {
  return new Promise((resolve, reject) => {
    let found = false;
    visit(ast)({
      enter(path) {
        if (path.node.id && path.node.id.name === name) {
          path.stop();
          found = true;
          resolve({node: path.node});
        } else if (types.isImportDeclaration(path.node)) {
          let isDefaultExport = false;
          let isImportedIdentifier = path.node.specifiers.some(specifier => {
            const matchesName = specifier.local.name === name;
            if (matchesName) {
              isDefaultExport = types.isImportDefaultSpecifier(specifier);
              return true;
            }
          });
          if (isImportedIdentifier) {
            found = true;
            resolve({ isImport: true, isDefaultExport, srcPath: path.node.source.value });
          }
        }
      }
    });

    if (!found) {
      reject(new ReferenceError(`Node with id ${name} not found`));
    }
  });
};

const findIdentifierNode = async ({ name, ast, cwd }) => {
  const result = await findNodeOrImport({ast, name});
  if (result.isImport) {
    const { source } = await readFile(cwd ? path.join(cwd, result.srcPath) : result.srcPath);
    return require('../get-export')(source, result.isDefaultExport ? undefined : name, cwd);
  } else {
    return result.node.init ||  result.node;
  }
};

module.exports = findIdentifierNode;
