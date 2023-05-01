const path = require('path');
const fs = require('fs');
const express = require('express');
const handlebars = require('handlebars');

// -----
const publicPath = path.join(__dirname, 'public');
const port = parseInt(process.env.SERVER_PORT) || 3000;
const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';
const isDebug = process.env.DEBUG || false;
// -----

const app = express();

function debug(message, ...optionalParams) {
  if (isDebug) {
    console.log.apply(null, arguments);
  }
}

console.log('---------');
debug('Debug is enabled')
console.log('serverUrl is ', serverUrl)
console.log('port is ', port)
console.log('publicPath is ', publicPath)
console.log('---------');

// if path = ('<dir>/' || '<dir>/index.html')
//  -> '<dir>/index.template.p.html'
//  -> '<dir>/index.template.m.html'
//  -> '<dir>/index.template.html'
//  -> '<dir>/index.html'
//  -> 404
app.use((req, res, next) => {
  debug('REQUEST', req.path)

  if (req.path.endsWith('/') || req.path.endsWith('\\')) {
    debug('  - without file')

    if (renderTemplates(req.path, res)) {
      return;
    }
  } else {
    const name = path.basename(req.path);

    // double test for faster image delivery
    if (name.startsWith('index.')) {
      debug('  - with index.')

      if (name === 'index.html') {
        debug('  - with index.html')

        if (renderTemplates(path.dirname(req.path), res)) {
          return;
        }
      }

      if (name === 'index.p.html' || name === 'index.template.p.html') {
        debug('  - with index.p.html')

        if (renderTemplate(path.dirname(req.path), 'index.template.p.html',
            res)) {
          return;
        }
      }

      if (name === 'index.m.html' || name === 'index.template.m.html') {
        debug('  - with index.m.html')

        if (renderTemplate(path.dirname(req.path), 'index.template.m.html',
            res)) {
          return;
        }
      }

      if (name === 'index.template.html') {
        debug('  - with index.template.html')

        if (renderTemplate(path.dirname(req.path), 'index.template.html',
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

  return renderTemplate(reqPath, 'index.template.p.html', res)
      || renderTemplate(reqPath, 'index.template.m.html', res)
      || renderTemplate(reqPath, 'index.template.html', res)
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
    url: path.join(serverUrl, reqPath, 'index.html'),
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
