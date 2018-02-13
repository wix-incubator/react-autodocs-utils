/* global Promise */

const pathJoin = require('path').join;
const readFolder = require('../read-folder');
const readFile = require('../read-file');
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
      const metadata = metadataParser(path)
        .catch(e =>
          error(`Unable to parse component in path "${path}", reason: ${e}`)
        );

      const readMarkdown = markdownPath =>
        containsFile(files)(markdownPath)
          .then(file => readFile(pathJoin(path, file)))
          .then(({source}) => source)
          .catch(() => Promise.resolve(''));

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
