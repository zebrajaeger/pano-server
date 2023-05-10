const {Worker} = require('node:worker_threads');
const path = require('path');

const server = new Worker(path.join(__dirname, 'server_thread.js'), {});
const indexer = new Worker(path.join(__dirname, 'indexer_thread.js'), {});
indexer.on('message', (msg) => {
  server.postMessage(msg);
});
