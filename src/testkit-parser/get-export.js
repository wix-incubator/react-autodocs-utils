const parse = require('../parser/parse');
const visit = require('../parser/visit');
const types = require('@babel/types');
const getObjectMethods = require('./get-object-methods');
const getReturnValue = require('./utils/get-return-value');
const { optimizeSource, optimizeAST } = require('./utils/optimizations');
const followImport = require('./utils/follow-import');

const DEFAULT_EXPORT = 'default';

const byName = name => ({ node }) => node.name === name;

const byPattern = regex => ({ node }) => regex.test(node.name);

const findNamedExportDeclaration = (nodes, predicate) => {
  const exportedNode = nodes.find(predicate);
  if (exportedNode) {
    return exportedNode.init || exportedNode;
  }
};

module.exports = async (code, exportName = DEFAULT_EXPORT, cwd) => {
  const ast = optimizeAST(parse(optimizeSource(code)));

  let exportedNode;
  let exportDefaultNode;
  let exportNamedNodes = [];
  visit(ast)({
    ExportDefaultDeclaration(path) {
      exportDefaultNode = path.node.declaration;
    },
    ExportNamedDeclaration(path) {
      const exportSource = path.node.source;
      path.traverse({
        VariableDeclarator(path) {
          exportNamedNodes.push({ node: path.node.id });
        },
        ExportSpecifier(path) {
          exportNamedNodes.push({ node: path.node.local, source: exportSource });
        }
      });
    }
  });

  if (exportName === DEFAULT_EXPORT) {
    exportedNode = exportDefaultNode || findNamedExportDeclaration(exportNamedNodes, byPattern(/DriverFactory$/));
  } else {
    exportedNode = findNamedExportDeclaration(exportNamedNodes, byName(exportName));
  }

  if (exportedNode.node) {
    if (exportedNode.source) {
      // resolve
      followImport({ cwd, sourcePath: exportedNode.source, exportName: exportedNode.name });
    }
    exportedNode = exportedNode.node;
  }

  if (!exportedNode) {
    throw `export "${exportName}" not found`;
  }

  const returnValue = await getReturnValue(ast, exportedNode, cwd);
  return getObjectMethods({ nodes: ast.program.body, node: returnValue, ast, cwd });
};
