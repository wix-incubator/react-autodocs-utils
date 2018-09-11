const types = require('@babel/types');

const findIdentifierNode = require('./utils/find-identifier-node');
const getComments = require('./get-comments');
const flatten = require('./utils/flatten');
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

const isFunction = node => [
    types.isArrowFunctionExpression,
    types.isFunctionDeclaration,
    types.isFunctionExpression
  ].some(checker => checker(node));

const resolveArguments = ({ nodes, node }) => {
  if (isFunction(node)) {
    const args = getArguments(node);
    const type = 'function';
    return { args, type };
  } else if (types.isIdentifier(node)) {
    const resolvedIdentifier = findIdentifierNode({ nodes, name: node.name })
    return resolveArguments({ nodes, node: resolvedIdentifier });
  }
  throw `Cannot resolve arguments for ${node.type}`;
};

const getNodeDescriptor = ({ nodes, node }) => {
  if (types.isSpreadElement(node)) {
    const spreadIdentifier = node.argument;
    const identifierNode = findIdentifierNode({ nodes, name: spreadIdentifier.name });
    return getObjectMethods({ nodes, node: identifierNode });
  }

  const value = node.value;

  const { args, type } = resolveArguments({ nodes, node: value });
  const comments = getComments(node);

  const name = node.key.name;
  return { name, type, args, ...comments }
}

const getObjectMethods = ({ nodes, node }) =>
  flatten(node.properties.map(property => getNodeDescriptor({ nodes, node: property })));

module.exports = getObjectMethods;