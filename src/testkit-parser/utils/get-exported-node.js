const parse = require('../../parser/parse');
const visit = require('../../parser/visit');
const reduceToObject = require('./reduce-to-object');
const followImport = require('./follow-import');

const DEFAULT_EXPORT = 'default';

const byName = name => ({ node }) => node.name === name;

const byPattern = regex => ({ node }) => regex.test(node.name);

const findNamedExportDeclaration = (nodes, predicate) => {
  const exportedNode = nodes.find(predicate);
  if (exportedNode) {
    return exportedNode.init || exportedNode;
  }
};

module.exports = async ({ ast, exportName = DEFAULT_EXPORT, cwd }) => {
  let exportedNode;
  let exportDefaultNode;
  let exportNamedNodes = [];
  visit(ast)({
    ExportDefaultDeclaration(path) {
      exportDefaultNode = path.node.declaration;
    },
    ExportNamedDeclaration(path) {
      const exportSource = path.node.source && path.node.source.value;
      path.traverse({
        VariableDeclarator(path) {
          exportNamedNodes.push({ node: path.node.id });
        },
        ExportSpecifier(path) {
          exportNamedNodes.push({
            node: exportSource ? path.node.exported : path.node.local,
            local: path.node.local,
            source: exportSource,
          });
        },
      });
    },
  });

  if (exportName === DEFAULT_EXPORT) {
    exportedNode = exportDefaultNode || findNamedExportDeclaration(exportNamedNodes, byPattern(/DriverFactory$/i));
  } else {
    exportedNode = findNamedExportDeclaration(exportNamedNodes, byName(exportName));
  }

  if (exportedNode.node) {
    if (exportedNode.source) {
      exportedNode = await followImport({ cwd, sourcePath: exportedNode.source, exportName: exportedNode.local.name });
    } else {
      exportedNode = exportedNode.node;
    }
  }

  if (!exportedNode) {
    throw Error(`export "${exportName}" not found`);
  }

  return await reduceToObject({ node: exportedNode, ast, cwd });
};
