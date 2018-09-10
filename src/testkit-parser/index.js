const parse = require('../parser/parse');
const types = require('@babel/types');

const notSupported = context => `not supported: ${context}`;

const findNodeByName = ({ nodes, name }) => {
  const node = nodes.find(n => n.id && n.id.name === name);
  if (!node) {
    throw `node with name "${name}" not found`;
  }
  return node.init ? node.init : node;
};

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

const getArguments = declaration => {
  const isSupported = [
    types.isArrowFunctionExpression,
    types.isFunctionDeclaration
  ].some(typeChecker => typeChecker(declaration));

  if (!isSupported) {
    throw notSupported(`getArguments ${declaration.type}`);
  }

  return declaration.params.map(getArgument);
};

const getMethods = ast => {
  const body = ast.program.body;
  // eslint-disable-next-line
  console.log(JSON.stringify(body));
  const { declaration } = body.find(
    node => node.type === 'ExportDefaultDeclaration'
  );
  const node = types.isIdentifier(declaration)
    ? findIdentifierNode({ nodes: body, name: declaration.name })
    : declaration;
  if (!node) {
    throw 'node not found';
  }
  const args = getArguments(node);
  return [{ name: 'constructor', args }];
};

module.exports = async code => {
  const ast = await parse(code);
  return getMethods(ast);
};
