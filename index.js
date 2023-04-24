const path = require('path');
const fs = require('fs');
const express = require('express');
const handlebars = require('handlebars');

// -----
const publicPath = path.join(__dirname, 'public');
const defaultFile = 'index.html'
const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';
const templateExtension = '.template.html'
// -----

const app = express();
app.use((req, res, next) => {
  if (req.path.endsWith('/') || req.path.endsWith('\\')) {
    let newPath = path.posix.join(req.path, defaultFile);
    res.redirect(newPath);
  } else {
    next();
  }
});

app.get('*.html', (req, res, next) => {
  const originalPath = req.path;
  const panoPath = originalPath.replace(/\.html$/, templateExtension);
  const filePath = path.join(publicPath, panoPath);
  const currentPath = path.dirname(originalPath);
  const url = serverUrl + originalPath;

  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    const template = handlebars.compile(content);
    const rendered = template({
      serverUrl,
      url,
      currentPath,
      originalPath,
      panoPath
    });
    res.send(rendered);

    res.send(content);
  } else {
    next();
  }
});

app.use(express.static(publicPath));

app.use((req, res) => {
  res.status(404).send('Not found');
});

app.listen(3000, () => {
  console.log(
      `Server running at http://localhost:3000/; reachable @ ${serverUrl}`);
});
