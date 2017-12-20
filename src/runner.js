const [execPath, path, ...args] = process.argv;

const metadataParser = require('./metadata-parser');

metadataParser(args[0])
  .then(parsed => console.log(JSON.stringify(parsed, null, 2)));
