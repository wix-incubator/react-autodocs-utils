const parse = require('../parser/parse');
const types = require('@babel/types');
const getObjectMethods = require('./get-object-methods')

const findNodeByName = ({ nodes, name }) => {
  const node = nodes.find(n => n.id && n.id.name === name);
  if (!node) {
    throw `node with name "${name}" not found`;
  }
  return node.init ? node.init : node;
};


const flattenVariableDeclarations = nodes => {
  return nodes.filter(types.isVariableDeclaration).reduce((acc, x) => {
    acc.push(...x.declarations);
    return acc;
  }, []);
};

const findIdentifierNode = ({ nodes, name }) => {
  try {
    return findNodeByName({ nodes, name });
  } catch (e) {
    // ignore not found error
  }
  return findNodeByName({ nodes: flattenVariableDeclarations(nodes), name });
};



const findReturnStatementInFunctionBody = node => {
  const blockStatement = node.body;
  const blockNodes = blockStatement.body;
  const returnStatement = blockNodes.find(types.isReturnStatement)
  if (!returnStatement) {
    throw 'getReturnValue -> FunctionDeclaration -> Block Declaration :: no body';
  }
  const returnArgument = returnStatement.argument;
  return returnArgument;
}

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
      const identifierNode = findIdentifierNode({ nodes: ast.program.body, name: node.name });
      return getReturnValue(ast, identifierNode)
    default:
      throw 'getReturnValue -> default :: not implemented';
  }
}

module.exports = async code => {
  const ast = await parse(code);
  
  const defaultExport = ast.program.body.find(types.isExportDefaultDeclaration);
  if (!defaultExport) {
    throw 'default export not found';
  }
  const returnValue = getReturnValue(ast, defaultExport.declaration);
  return getObjectMethods(returnValue)
};
