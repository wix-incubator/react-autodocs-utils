const [/* execPath */, /* path */, ...args] = process.argv;

const metadataParser = require('./src/metadata-parser');

metadataParser(args[0])
  .then(parsed => console.log(JSON.stringify(parsed, null, 2)));
