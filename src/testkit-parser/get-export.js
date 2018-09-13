const parse = require('../parser/parse');
const types = require('@babel/types');
const getObjectMethods = require('./get-object-methods');
const getReturnValue = require('./utils/get-return-value');
const { optimizeSource, optimizeAST } = require('./utils/optimizations');

const DEFAULT_EXPORT = 'default';

const byName = name => node => node.id && node.id.name === name;

const byPattern = regex => node => node.id && regex.test(node.id.name);

const findNamedExportDeclaration = (nodes, predicate) => {
  for (const node of nodes) {
    if (types.isExportNamedDeclaration(node)) {
      const exportedNode = node.declaration.declarations.find(predicate);
      if (exportedNode) {
        return exportedNode.init || exportedNode;
      }
    }
  }
};

module.exports = async (code, exportName = DEFAULT_EXPORT, cwd) => {
  const ast = optimizeAST(parse(optimizeSource(code)));
  const body = ast.program.body;

  let exportedNode;
  if (exportName === DEFAULT_EXPORT) {
    const exportNode = body.find(types.isExportDefaultDeclaration);
    exportedNode = exportNode ? exportNode.declaration : findNamedExportDeclaration(body, byPattern(/DriverFactory$/));
  } else {
    exportedNode = findNamedExportDeclaration(body, byName(exportName));
  }

  if (!exportedNode) {
    throw `export "${exportName}" not found`;
  }

  const returnValue = await getReturnValue(ast, exportedNode, cwd);
  return getObjectMethods({ nodes: ast.program.body, node: returnValue, ast, cwd });
};
