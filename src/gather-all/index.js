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


const gatherAll = path =>
  isPath(path)
    .then(readFolder)

    .then(files => {
      const maybeFile = containsFile(files);

      const readMarkdown = markdownPath =>
        maybeFile(markdownPath)
          .then(file => readFile(pathJoin(path, file)))
          .catch(() => Promise.resolve(''));

      const metadata = maybeFile('index.js')
        .then(file =>
          metadataParser(pathJoin(path, file))
            .catch(e => error(`Unable to parse component in path "${path}" ${e}`))
        )
        .catch(() => error(`Unable to find required \`index.js\` in path "${path}"`));

      const readme = readMarkdown('readme.md');
      const readmeAccessibility = readMarkdown('readme.accessibility.md');
      const readmeTestkit = readMarkdown('readme.testkit.md');

      return Promise.all([
        metadata,
        readme,
        readmeAccessibility,
        readmeTestkit
      ]).then(([metadata, readme, readmeAccessibility, readmeTestkit]) => ({
        ...metadata,
        readme,
        readmeAccessibility,
        readmeTestkit
      }));
    });


module.exports = gatherAll;
