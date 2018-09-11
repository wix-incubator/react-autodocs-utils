const types = require('@babel/types');

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

const getObjectMethods = node => {
  return node.properties.map(property => {
    const name = property.key.name;
    const value = property.value;
    let args = []
    switch (value.type) {
      case 'ArrowFunctionExpression':
      case 'FunctionDeclaration':
      case 'FunctionExpression':
        args = getArguments(value);
        break;

      default:
        throw `getObjectMethods -> default :: not implemented for ${value.type}`;

    }
    return {name, args}
  })
};

module.exports = getObjectMethods;