const pathSeparator = '/';

module.exports = flatTree =>
  Object.keys(flatTree).map(k => ({
    path: k.split(pathSeparator),
    contents: flatTree[k]
  })).reduce((fs, { path, contents }) => {
    let nextSegmentName = path.shift();
    let previousSegment = fs;
    while (nextSegmentName) {

      if (path.length === 0) {
        previousSegment[nextSegmentName] = contents;
        break;
      }

      const currentSegment = {};
      previousSegment[nextSegmentName] = currentSegment;
      previousSegment = currentSegment;
      nextSegmentName = path.shift();
    }
    return fs;
  }, {});