const types = require('@babel/types');

const findIdentifierNode = require('./utils/find-identifier-node');
const getComments = require('./get-comments');
const notSupported = context => `not supported: ${context}`;

const getArgument = param => {
  if (types.isObjectPattern(param)) {
    const keys = param.properties.map(({ key: { name } }) => name);
    return { name: `{${keys.join(', ')}}` };
  }

  if (types.isIdentifier(param)) {
    return { name: param.name };
  }

  throw notSupported(`getArgument ${param}`);
};

const getArguments = declaration => {
  const isSupported = [
    types.isArrowFunctionExpression,
    types.isFunctionDeclaration,
    types.isFunctionExpression
  ].some(typeChecker => typeChecker(declaration));

  if (!isSupported) {
    throw notSupported(`getArguments ${declaration.type}`);
  }

  return declaration.params.map(getArgument);
};

const getObjectMethods = ({ nodes, node }) => {
  return node.properties.map(property => {

    if (types.isSpreadElement(property)) {
      const spreadIdentifier = property.argument;
      const identifierNode = findIdentifierNode({ nodes, name: spreadIdentifier.name });
      return getObjectMethods({ nodes, node: identifierNode });
    }

    const name = property.key.name;
    const value = property.value;
    let args = []; 
    switch (value.type) {
      case 'ArrowFunctionExpression':
      case 'FunctionDeclaration':
      case 'FunctionExpression':
        args = getArguments(value);
        break;

      case 'Identifier':
        const identifierNode = findIdentifierNode({ nodes, name: value.name })
        args = getArguments(identifierNode);
        break;

      default:
        throw `getObjectMethods -> default :: not implemented for ${value.type}`;

    }

    const comments = getComments(property);

    return { name, args, ...comments }
  }).reduce((acc, x) => {
    return acc.concat(x);
  }, [])
};

module.exports = getObjectMethods;