const express = require('express');
const path = require('path');

const app = express();

const publicPath = path.join(__dirname, 'public');
const defaultFile = 'index.html'

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
  const panoPath = originalPath.replace(/\.html$/, '.pano.html');
  const fullPath = path.join(publicPath, panoPath);
  res.sendFile(fullPath, err => {
    if (err) {
      next();
    }
  });
});

app.use(express.static(publicPath));

app.use((req, res) => {
  res.status(404).send('Not found');
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
