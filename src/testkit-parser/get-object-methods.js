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

const resolveArguments = ({ node, ast }) => {
  if (isFunction(node)) {
    const args = getArguments(node);
    const type = 'function';
    return { args, type };
  } else if (types.isIdentifier(node)) {
    const resolvedIdentifier = findIdentifierNode({ name: node.name, ast })
    return resolveArguments({ node: resolvedIdentifier, ast });
  } else if (types.isObjectExpression(node)) {
    return {
      type: 'object',
      props: getObjectMethods({ node })
    }
  }
  throw `Cannot resolve arguments for ${node.type}`;
};

const getNodeDescriptor = ({ node, ast }) => {
  if (types.isSpreadElement(node)) {
    const spreadIdentifier = node.argument;
    const identifierNode = findIdentifierNode({ name: spreadIdentifier.name, ast });
    return getObjectMethods({ node: identifierNode, ast });
  }

  const value = node.value;

  const descriptor = resolveArguments({ node: value, ast });
  const comments = getComments(node);

  const name = node.key.name;
  return { name, ...descriptor, ...comments }
};

const getObjectMethods = ({ node, ast }) => {
  const objectNode = types.isIdentifier(node) ? findIdentifierNode({ name: node.name, ast }) : node;
  return flatten(objectNode.properties.map(property => getNodeDescriptor({ node: property, ast })));
};


module.exports = getObjectMethods;