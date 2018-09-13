#!/usr/bin/env node

/* eslint no-console:0 */

const path = require('path');
const fs = require('fs');
const getExport = require('./get-export');

const main = async () => {
  const [, script, ...argv] = process.argv;
  const isDumpMode = argv.find(x => x === '--dump');
  const target = argv.pop();
  const stat = fs.existsSync(target) && fs.statSync(target);
  const isDirectory = stat && stat.isDirectory();
  const isFile = stat && stat.isFile();

  if (!isDirectory && !isFile) {
    usage(script);
    process.exit(0);
  }

  scan({ target, isDirectory, isDumpMode });
};

async function scan({ target, isDirectory, isDumpMode }) {
  // prettier-ignore
  const result = isDirectory
    ?  await scanDir(target, isDumpMode)
    : [await scanFile(target, isDumpMode)];

  if (isDumpMode) {
    console.log(JSON.stringify(result));
    return;
  }

  let hasError = false;
  result.forEach(({ file, error }) => {
    if (error) {
      hasError = true;
      return fail(file, error);
    }
    ok(file);
  });

  process.exit(hasError ? 1 : 0);
}

async function scanDir(dir) {
  return Promise.all(getFiles(dir, path => /\.driver\.(js|ts)x?$/.test(path)).map(scanFile));
}

async function scanFile(file) {
  const source = fs.readFileSync(file, 'utf8');
  return getExport(source, undefined, path.dirname(file)).then(
    descriptor => ({ file, descriptor }),
    error => ({ file, error: error.stack ? error.stack.toString() : error })
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
  console.log('\x1b[31m', 'FAIL', '\x1b[0m', file, '\x1b[31m', error, '\x1b[0m');
}

function ok(file) {
  console.log('\x1b[32m', 'OK', '\x1b[0m', file);
}

function usage(script) {
  console.log(`Usage ./${path.basename(script)} [options] <dir | file>

Options:
  --dump          dump result to console`);
}

main();
