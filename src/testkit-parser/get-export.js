const parse = require('../parser/parse');
const types = require('@babel/types');
const findIdentifierNode = require('./utils/find-identifier-node');
const getObjectMethods = require('./get-object-methods');

const DEFAULT_EXPORT = 'default';

const findReturnStatementInFunctionBody = node => {
  const blockStatement = node.body;
  const blockNodes = blockStatement.body;
  const returnStatement = blockNodes.find(types.isReturnStatement)
  if (!returnStatement) {
    throw 'getReturnValue -> FunctionDeclaration -> Block Declaration :: no body';
  }
  const returnArgument = returnStatement.argument;
  return returnArgument;
};

const getReturnValue = async (ast, node) => {
  switch(node.type) {
    case 'ArrowFunctionExpression':
      if (types.isObjectExpression(node.body)) {
        return node.body;
      }
      return findReturnStatementInFunctionBody(node);

    case 'FunctionDeclaration':
      return findReturnStatementInFunctionBody(node);
    case 'Identifier':
      const identifierNode = await findIdentifierNode({ name: node.name, ast });
      return getReturnValue(ast, identifierNode)
    default:
      throw 'getReturnValue -> default :: not implemented';
  }
};

module.exports = async (code, exportName = DEFAULT_EXPORT) => {
  const ast = parse(code);

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
        })
      }
    });
  }


  if (!exportedNode) {
    throw `export "${exportName}" not found`;
  }

  const returnValue = await getReturnValue(ast, exportedNode);
  return getObjectMethods({ nodes: ast.program.body, node: returnValue, ast });
};
