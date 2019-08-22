const isDriver = path => (path.includes('.private') ? false : /\.driver\.(js|ts)x?$/.test(path));

module.exports = isDriver;
