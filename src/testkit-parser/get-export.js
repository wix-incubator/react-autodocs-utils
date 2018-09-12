const parse = require('../parser/parse');
const types = require('@babel/types');
const getObjectMethods = require('./get-object-methods');
const getReturnValue = require('./utils/get-return-value');
const { optimizeSource } = require('./utils/optimizations');

const DEFAULT_EXPORT = 'default';

module.exports = async (code, exportName = DEFAULT_EXPORT, cwd) => {
  const ast = parse(optimizeSource(code));

  let exportedNode;
  if (exportName === DEFAULT_EXPORT) {
    const exportNode = ast.program.body.find(types.isExportDefaultDeclaration);
    if (exportNode) {
      exportedNode = exportNode.declaration;
    }
  } else {
    ast.program.body.forEach(node => {
      if (types.isExportNamedDeclaration(node)) {
        node.declaration.declarations.forEach(node => {
          if( node.id && node.id.name === exportName) {
            exportedNode = node.id;
          }
        });
      }
    });
  }

  if (!exportedNode) {
    throw `export "${exportName}" not found`;
  }

  const returnValue = await getReturnValue(ast, exportedNode, cwd);
  return getObjectMethods({ nodes: ast.program.body, node: returnValue, ast, cwd });
};
