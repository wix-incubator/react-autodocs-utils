const types = require('@babel/types');
const findIdentifierNode = require('./find-identifier-node');

const findReturnStatementInFunctionBody = node => {
  const blockStatement = node.body;

  if (Array.isArray(blockStatement.body)) {
    const blockNodes = blockStatement.body;
    const returnStatement = blockNodes.find(types.isReturnStatement);
    if (!returnStatement) {
      throw 'getReturnValue -> FunctionDeclaration -> Block Declaration :: no body';
    }
    const returnArgument = returnStatement.argument;
    return returnArgument;
  } else if (types.isArrowFunctionExpression(blockStatement)) {
    return blockStatement;
  }
  throw `findReturnStatementInFunctionBody :: not implemented for ${node.type}`;
};

const getReturnValue = async (ast, node, cwd) => {
  switch(node.type) {
  case 'ArrowFunctionExpression':
    if (types.isObjectExpression(node.body)) {
      return node.body;
    }
    return findReturnStatementInFunctionBody(node);

  case 'FunctionDeclaration':
    return findReturnStatementInFunctionBody(node);
  case 'Identifier': {
    const identifierNode = await findIdentifierNode({ name: node.name, ast, cwd });
    if (Array.isArray(identifierNode)) {
      return identifierNode;
    }
    return getReturnValue(ast, identifierNode, cwd);
  }
  default:
    throw `getReturnValue not implemented for ${node.type}`;
  }
};

module.exports = getReturnValue;
