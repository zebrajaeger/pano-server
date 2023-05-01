'use strict'
const {parentPort} = require('node:worker_threads')
const path = require('path');
const fs = require('fs');
const express = require('express');
const handlebars = require('handlebars');
const {
  INDEX_PREFIX,
  INDEX_HTML,
  INDEX_TEMPLATE_HTML,
  INDEX_M_HTML,
  INDEX_M_TEMPLATE_HTML,
  INDEX_P_HTML,
  INDEX_P_TEMPLATE_HTML,
  isDebug, debug
} = require('./constants')

// -----
const publicPath = path.join(path.dirname(__dirname), 'public');
const port = parseInt(process.env.SERVER_PORT) || 3000;
const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';
// -----

console.log('---------');
debug('Debug is enabled')
console.log('serverUrl is ', serverUrl)
console.log('port is ', port)
console.log('publicPath is ', publicPath)
console.log('---------');

let panos = [];
parentPort.on('message', msg => {
  panos = msg
  debug('panos', panos)
});

const app = express();
app.use((req, res, next) => {
  if (req.path === '/') {
    res.redirect('/index.html')
  } else {
    next()
  }
})

app.use((req, res, next) => {
  if (req.path === '/index.html') {
    const a = '<html lang="en"><head><title="toc"></title></head><body><ul>'
    const b = '</ul></body></html>';
    const links = [];
    for (const pano of panos) {
      links.push(`<li><a href="${pano}">${pano}<a></li>`)
    }
    const html = a + links.join('') + b;
    res.send(html);
  } else {
    next();
  }
});

// if path = ('<dir>/' || '<dir>/index.html')
//  -> '<dir>/index.template.p.html'
//  -> '<dir>/index.template.m.html'
//  -> '<dir>/index.template.html'
//  -> '<dir>/index.html'
//  -> 404
app.use((req, res, next) => {
  debug('REQUEST', req.path)

  if (req.path.endsWith('/')) {
    debug('  - without file')

    if (renderTemplates(req.path.slice(0, -1), res)) {
      return;
    }
  } else {
    const name = path.basename(req.path);

    // double test for faster image delivery
    if (name.startsWith(INDEX_PREFIX)) {
      debug('  - with index.')

      if (name === INDEX_HTML) {
        debug('  - with index.html')

        if (renderTemplates(path.dirname(req.path), res)) {
          return;
        }
      }

      if (name === INDEX_P_HTML || name === INDEX_P_TEMPLATE_HTML) {
        debug('  - with index.p.html')

        if (renderTemplate(path.dirname(req.path), INDEX_P_TEMPLATE_HTML,
            res)) {
          return;
        }
      }

      if (name === INDEX_M_HTML || name === INDEX_M_TEMPLATE_HTML) {
        debug('  - with index.m.html')

        if (renderTemplate(path.dirname(req.path), INDEX_M_TEMPLATE_HTML,
            res)) {
          return;
        }
      }

      if (name === INDEX_TEMPLATE_HTML) {
        debug('  - with index.template.html')

        if (renderTemplate(path.dirname(req.path), INDEX_TEMPLATE_HTML,
            res)) {
          return;
        }
      }
    }
  }
  next();
})

function renderTemplates(reqPath, res) {
  debug('renderTemplates', reqPath)

  return renderTemplate(reqPath, INDEX_P_TEMPLATE_HTML, res)
      || renderTemplate(reqPath, INDEX_M_TEMPLATE_HTML, res)
      || renderTemplate(reqPath, INDEX_TEMPLATE_HTML, res)
}

function renderTemplate(reqPath, templateFileName, res) {
  debug('  - renderTemplate', reqPath, templateFileName)

  const templateFilePath = path.join(publicPath, reqPath, templateFileName);
  debug('    - templateFilePath', templateFilePath)

  if (!fs.existsSync(templateFilePath)) {
    debug('    -> no file')

    return false;
  }

  let content = fs.readFileSync(templateFilePath, 'utf8');

  const template = handlebars.compile(content);
  const context = {
    serverUrl,
    url: path.join(serverUrl, reqPath, INDEX_HTML),
    currentPath: reqPath,
  };

  if (isDebug) {
    debug('    -> render', JSON.stringify(context));
  }

  const rendered = template(context);
  res.send(rendered);

  return true;
}

// all static file fom public directory
app.use(express.static(publicPath));

// not found -> 404
app.use((req, res) => {
  res.status(404).send('Not found');
});

// start server
app.listen(port, () => {
  console.log(
      `Server running at http://localhost:${port}/; reachable @ ${serverUrl}`);
});
