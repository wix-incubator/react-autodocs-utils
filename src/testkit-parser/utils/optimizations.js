const mergeDriversToSpread = sourceCode => {
  const regexMergeDrivers = /mergeDrivers\(([^,\\)\s]+),\s*([^,\\)\s]+)\s*\)/g;
  return sourceCode.replace(regexMergeDrivers, '{...$1, ...$2}');
};

const optimizeSource = sourceCode =>
  mergeDriversToSpread(sourceCode);

module.exports = {
  optimizeSource,
};
