const types = require('@babel/types');

const findIdentifierNode = require('./utils/find-identifier-node');
const getComments = require('./get-comments');
const flatten = require('./utils/flatten');
const getReturnValue = require('./utils/get-return-value');
const notSupported = context => `not supported: ${context}`;

const getArgument = param => {
  if (types.isObjectPattern(param)) {
    const keys = param.properties.map(({ key: { name } }) => name);
    return { name: `{${keys.join(', ')}}` };
  }

  if (types.isIdentifier(param)) {
    return { name: param.name };
  }

  if (types.isAssignmentPattern(param)) {
    return { name: param.left.name };
  }

  if (types.isRestElement(param)) {
    return { name: `...${param.argument.name}` };
  }

  throw notSupported(`getArgument ${param.type}`);
};

const getArguments = declaration => {
  const isSupported = isFunction(declaration)
  if (!isSupported) {
    throw notSupported(`getArguments ${declaration.type}`);
  }

  return declaration.params.map(getArgument);
};

const isFunction = node => [
  types.isArrowFunctionExpression,
  types.isFunctionDeclaration,
  types.isFunctionExpression,
  types.isObjectMethod
].some(checker => checker(node));

const isValue = node => [
  types.isBooleanLiteral,
  types.isNumericLiteral
].some(checker => checker(node));

const resolveArguments = async ({ node, ast, cwd }) => {
  if (isFunction(node)) {
    const args = getArguments(node);
    const type = 'function';
    return { args, type };
  } else if (types.isIdentifier(node)) {
    try {
      const resolvedIdentifier = await findIdentifierNode({ name: node.name, ast, cwd });
      if (Array.isArray(resolvedIdentifier)) {
        return { type: 'object', props: resolvedIdentifier };
      }
      return resolveArguments({ node: resolvedIdentifier, ast, cwd });
    } catch (e) {
      if (e instanceof ReferenceError) {
        // identifier is not declared - probably a function argument
        return {
          type: 'unknown'
        };
      }
      throw e;
    }
  } else if (types.isObjectExpression(node)) {
    return {
      type: 'object',
      props: await getObjectMethods({ node, ast, cwd })
    };
  } else if (isValue(node)) {
    return {
      type: 'value'
    };
  } else if (types.isCallExpression(node)) {
    const returnValue = await getReturnValue(ast, node.callee, cwd);
    if (types.isArrowFunctionExpression(returnValue)) {
      return {
        type: 'function',
        args: getArguments(returnValue)};
    }
    return {
      type: 'object',
      props: returnValue
    };
  } else if (types.isMemberExpression(node)) {
    const callExpression = node.object;
    const returnedObject = await resolveArguments({ node: callExpression, ast, cwd });
    const returnedObjectMember = returnedObject.props.find(entry => entry.name === node.property.name);
    return {
      type: 'object',
      props: returnedObjectMember.props
    };
  } else if (types.isLogicalExpression(node)) {
    return await resolveArguments({ node: node.right, ast, cwd });
  }
  throw `Cannot resolve arguments for ${node.type}`;
};

const getNodeDescriptor = async ({ node, ast, cwd}) => {
  if (types.isSpreadElement(node)) {
    const spreadNode = node.argument;
    if (types.isIdentifier(spreadNode)) {
      const identifierNode = await findIdentifierNode({ name: spreadNode.name, ast, cwd });
      try {
        return await getObjectMethods({ node: identifierNode, ast, cwd });
      } catch (e) {
        return {
          name: spreadNode.name,
          type: 'error'
        }
      }
    } else if (types.isCallExpression(spreadNode)) {
      const callee = spreadNode.callee;
      if (types.isIdentifier(callee)) {
        return getObjectMethods({ node: callee, ast, cwd})
      } else if (types.isArrowFunctionExpression(callee)) {
        return getObjectMethods({ node: getReturnValue(ast, callee, cwd), ast, cwd });
      }
      throw 'getNodeDescriptor -> CallExpression :: not implemented';
    } else if (types.isObjectExpression(spreadNode)) {
      return getObjectMethods({ node: spreadNode, ast, cwd });
    } else if (types.isMemberExpression(spreadNode)) {
      const memberObject = await findIdentifierNode({ name: spreadNode.object.name, ast, cwd })
      const memberProperties = await getObjectMethods({ node: memberObject, ast, cwd });
      const memberProperty = memberProperties.find(prop => prop.name === spreadNode.property.name);
      return memberProperty.props;
    }
    throw `getNodeDescriptor -> SpreadElement :: not implemented for ${spreadNode.type}`
  }

  const nodeValue = types.isObjectMethod(node) ? node : node.value
  const descriptor = await resolveArguments({ node: nodeValue, ast, cwd });
  const comments = getComments(node);

  const name = node.key.name;
  return { name, ...descriptor, ...comments };
};

const getObjectMethods = async ({ node, ast, cwd }) => {
  let objectNode = types.isIdentifier(node) ? await findIdentifierNode({ name: node.name, ast, cwd }) : node;
  if (Array.isArray(objectNode)) {
    return objectNode;
  }
  if (types.isArrowFunctionExpression(objectNode)) {
    objectNode = await getReturnValue(ast, objectNode, cwd)
  }
  if (types.isCallExpression(objectNode)) {
    return getObjectMethods({ node: objectNode.callee, ast, cwd });
  }
  if (!objectNode.properties) {
    throw Error(`Cannot resolve properties for ${node.type}`);
  }
  const methodPromises = objectNode.properties.map(property => getNodeDescriptor({ node: property, ast, cwd }));
  return flatten(await Promise.all(methodPromises));
};

module.exports = getObjectMethods;
