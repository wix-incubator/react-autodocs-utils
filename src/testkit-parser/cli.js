#!/usr/bin/env node

/* eslint no-console:0 */

const path = require('path');
const fs = require('fs');
const getExport = require('./get-export');

const main = () => {
  const [, script, target] = process.argv;
  const stat = fs.existsSync(target) && fs.statSync(target);
  const isDirectory = stat && stat.isDirectory();
  const isFile = stat && stat.isFile();

  if (!isDirectory && !isFile) {
    console.log(`Usage ./${path.basename(script)} <dir | file>`);
    process.exit(0);
  }

  return isDirectory ? scanDir(target) : scanFile(target);
};

function scanDir(dir) {
  getFiles(dir, path => /\.driver\.(js|ts)x?$/.test(path)).forEach(file => {
    const source = fs.readFileSync(file, 'utf8');
    getExport(source, undefined, path.dirname(file)).then(() => ok(file), err => fail(file, err));
  });
}

function scanFile(file) {
  const source = fs.readFileSync(file, 'utf8');
  getExport(source, undefined, path.dirname(file)).then(
    () => {
      ok(file);
      process.exit(0);
    },
    err => {
      fail(file, err);
      process.exit(1);
    }
  );
}

function getFiles(dir, predicate = () => true) {
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
}

function fail(file, error) {
  console.log(
    '\x1b[31m',
    'FAIL',
    '\x1b[0m',
    file,
    '\x1b[31m',
    error,
    '\x1b[0m'
  );
}

function ok(file) {
  console.log('\x1b[32m', 'OK', '\x1b[0m', file);
}

main();
