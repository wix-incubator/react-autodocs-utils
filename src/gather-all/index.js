/* global Promise */

const pathJoin = require('path').join;
const readFolder = require('../fs/read-folder');
const readFile = require('../fs/read-file');
const metadataParser = require('../metadata-parser');

// containsFile : List String -> Bool -> Promise
const containsFile = files => name => {
  const file = files.find(f => f.toLowerCase() === name.toLowerCase());

  return file
    ? Promise.resolve(file)
    : Promise.reject();
};

// isPath : String -> Promise
const isPath = path =>
  path
    ? Promise.resolve(path)
    : Promise.reject('Error: gatherAll is missing required `path` argument');

// error : String -> Promise
const error = message =>
  Promise.reject(new Error(message));

const graceFail = a =>
  () => Promise.resolve(a);

const gatherAll = path =>
  isPath(path)
    .then(readFolder)

    .then(files => {
      const maybeFile = containsFile(files);

      const metadata = maybeFile('index.js')
        .then(file =>
          metadataParser(pathJoin(path, file))
            .catch(e =>
              error(`Unable to parse component in path "${path}" ${e}`)
            )
        )
        .catch(() => error(`Unable to find required \`index.js\` in path "${path}"`));

      const readme = maybeFile('readme.md')
        .then(file => readFile(pathJoin(path, file)))
        .catch(graceFail(''));

      const readmeAccessibility = maybeFile('readme.accessibility.md')
        .then(file => readFile(pathJoin(path, file)))
        .catch(graceFail(''));

      return Promise.all([
        metadata,
        readme,
        readmeAccessibility
      ]).then(([metadata, readme, readmeAccessibility]) => ({
        ...metadata,
        readme,
        readmeAccessibility
      }));
    });


module.exports = gatherAll;
