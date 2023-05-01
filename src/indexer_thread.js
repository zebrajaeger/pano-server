'use strict';
const {parentPort} = require('worker_threads');
const fs = require('fs')
const path = require('path')
const {INDEX_ALL, debug} = require("./constants");
const publicPath = path.posix.join(path.dirname(__dirname), 'public');

const INTERVAL = 60000; // 1min

setTimeout(index, 0);

function index() {
  let dirs = scanDir(publicPath);
  parentPort.postMessage(dirs);
  setTimeout(index, INTERVAL);
}

function scanDir(dir) {
  debug('scanDir', dir)
  const fileNames = fs.readdirSync(dir);

  // is Leaf -> stop
  if (isLeafDirectory(fileNames)) {
    debug('  -> leaf')
    return [path.posix.relative(publicPath, dir)];
  }

  let result = [];
  for (let fileName of fileNames) {
    const filePath = path.posix.join(dir, fileName);
    let stat = fs.lstatSync(filePath);
    if (stat.isDirectory()) {
      result = result.concat(scanDir(filePath))
    }
  }

  return result;
}

function isLeafDirectory(fileNames) {
  for (let fileName of fileNames) {
    if (INDEX_ALL.includes(fileName)) {
      return true;
    }
  }
}
