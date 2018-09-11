#!/usr/bin/env node

/* eslint no-console:0 */

const path = require('path');
const fs = require('fs');
const [, script, dir] = process.argv;
const isDirectory = path =>
  fs.existsSync(path) && fs.statSync(path).isDirectory();

if (!isDirectory(dir)) {
  console.log(`Usage ./${path.basename(script)} <dir>`);
  process.exit(0);
}

const getFiles = (dir, predicate = () => true) => {
  const results = [];
  fs.readdirSync(dir).forEach(file => {
    const newPath = path.join(dir, file);
    const stat = fs.statSync(newPath);
    if (stat && stat.isDirectory()) {
      results.push(...getFiles(newPath, predicate));
      return;
    }
    if (predicate(newPath)) {
      results.push(newPath);
    }
  });
  return results;
};

const getDefaultExport = require('./get-default-export');
const fail = file => console.log('\x1b[31m', 'FAIL', '\x1b[0m', file);
const ok = file => console.log('\x1b[32m', 'OK', '\x1b[0m', file);

getFiles(dir, path => path.endsWith('.driver.js')).forEach(file => {
  const source = fs.readFileSync(file, 'utf8');
  getDefaultExport(source).then(() => ok(file), () => fail(file));
});
