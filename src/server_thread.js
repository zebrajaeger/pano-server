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
  INDEX_P_TEMPLATE_HTML
} = require('./constants')
const {isDebug, debug} = require('./debug')
const Tags = require('./tags')
const packageJson = require('../package.json');
const serverVersion = packageJson.version || '';

// -----
const publicPath = path.join(path.dirname(__dirname), 'public');
const port = parseInt(process.env.SERVER_PORT) || 3000;
const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';
// -----

console.log('---------');
console.log(`PanoServer v${serverVersion}`);
console.log('---------');
debug('Debug is enabled')
console.log('serverUrl is ', serverUrl)
console.log('port is ', port)
console.log('publicPath is ', publicPath)
console.log('---------');

let panoData = [];
let tags = new Tags([])
parentPort.on('message', msg => {
  panoData = msg
  tags = new Tags(msg.tags)
  debug('panoItems', panoData.panoItems)
  debug(tags.byCountDesc)
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
    const links = [];
    for (const pano of panoData.panoItems) {
      links.push(`
        <div class="item">
          <a href="/${pano.link}">
            <div class="link-content">
              <div class="pano-title">${pano.title}</div>
              <div class="pano-title">${pano.link}</div>
              <img class="preview-image" src="/${pano.scaledPreviewLink150}" alt="${pano.alt}">
            </div>
          <a>
        </div>
        `)
    }

    const html = `
    <html lang="en">
      <head>
        <title>PanoServer</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/icon.png">
        <link rel="stylesheet" href="/style.css">
      </head>
      <body>
        <div id="navbar">
          <div class="navbar-item navbar-title" >Panoserver v${serverVersion}</div>
          <a class="navbar-item" href="/impressum.html">Impressum</a>
        </div>

        <div class="root">
        ${links.join('')}
        </div>
      </body> 
    </html>`;
    res.send(html);
  } else {
    next();
  }
})

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

// assets
app.use(express.static(path.resolve(__dirname, '../assets')));

// not found -> 404
app.use((req, res) => {
  res.status(404).send('Not found');
});

// start server
app.listen(port, () => {
  console.log(
      `Server running at http://localhost:${port}/; reachable @ ${serverUrl}`);
});
