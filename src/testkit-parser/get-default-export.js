const parse = require('../parser/parse');
const types = require('@babel/types');
const findIdentifierNode = require('./utils/find-identifier-node');
const getObjectMethods = require('./get-object-methods');

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

const getReturnValue = (ast, node) => {
  switch(node.type) {
    case 'ArrowFunctionExpression':
      if (types.isObjectExpression(node.body)) {
        return node.body;
      }
      return findReturnStatementInFunctionBody(node);

    case 'FunctionDeclaration':
      return findReturnStatementInFunctionBody(node);
    case 'Identifier':
      const identifierNode = findIdentifierNode({ name: node.name, ast });
      return getReturnValue(ast, identifierNode)
    default:
      throw 'getReturnValue -> default :: not implemented';
  }
};

module.exports = async code => {
  const ast = await parse(code);

  const defaultExport = ast.program.body.find(types.isExportDefaultDeclaration);
  if (!defaultExport) {
    throw 'default export not found';
  }
  const returnValue = getReturnValue(ast, defaultExport.declaration);
  return getObjectMethods({ nodes: ast.program.body, node: returnValue, ast });
};
