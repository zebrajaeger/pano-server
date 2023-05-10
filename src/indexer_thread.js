'use strict';
const {parentPort} = require('worker_threads');
const fs = require('fs');
const path = require('path');
const {parse} = require('node-html-parser');
const Jimp = require('jimp');

const {
  INDEX_ALL, INDEX_P_HTML, INDEX_P_TEMPLATE_HTML,
  INDEX_M_TEMPLATE_HTML, INDEX_M_HTML
} = require("./constants");
const {debug} = require('./debug')
const publicPath = path.posix.join(path.dirname(__dirname), 'public');

const INTERVAL = 60000; // 1min

setTimeout(index, 0);

function index() {
  const panoItems = scanDir(publicPath);
  const tagList = collectTags(panoItems);

  const data = {
    tags: tagList,
    panoItems: panoItems
  }
  parentPort.postMessage(data);
  setTimeout(index, INTERVAL);
}

function collectTags(panoItems) {
  const map = {};

  for (const panoItem of panoItems) {
    if (panoItem.tags) {
      for (const tag of panoItem.tags) {
        let x = map[tag];
        x = x ? x + 1 : 1;
        map[tag] = x;
      }
    }
  }

  const list = [];
  for (const [key, value] of Object.entries(map)) {
    list.push({name: key, count: value});
  }

  return list;
}

function downscale(imageFilePath, height) {

  const panoServerPath = path.posix.join(path.dirname(imageFilePath),
      '.panoserver');
  fs.mkdirSync(panoServerPath, {recursive: true})

  const name = path.basename(imageFilePath) + '.' + height + '.jpg'; // name of scaled image
  const outputFile = path.resolve(panoServerPath, name);

  if (!fs.existsSync(outputFile)) {
    debug('DOWNSCALE', imageFilePath, outputFile)
    Jimp.read(imageFilePath, (err, img) => {
      if (err) {
        console.error("Image scaler error occurred", err);
      } else {
        img
        .scaleToFit(height + height, height)
        .quality(90)
        .write(outputFile);
        debug("Image scaled", imageFilePath, outputFile)
      }
    });
  }

  return path.posix.join('.panoserver', name);
}

function readMetaData(htmlFilePath) {
  let htmlString = fs.readFileSync(htmlFilePath, 'utf8');
  const root = parse.parse(htmlString);
  let metas = root.querySelectorAll('html head meta');
  const result = {};
  for (const meta of metas) {
    const prop = meta.getAttribute('name') || meta.getAttribute('property');
    if (prop) {
      result[prop] = meta.getAttribute('content');
    }
  }
  return result;
}

function readDescriptionData(descriptionFilePath) {
  const result = {
    title: null,
    description: null,
    location: null,
    tags: []
  }

  if (fs.existsSync(descriptionFilePath)) {
    let d = JSON.parse(fs.readFileSync(descriptionFilePath, "utf-8"));
    result.title = d.title;
    result.description = d.description;
    result.location = d.location;
    result.tags = d.tags;
  }

  return result;
}

/**
 * returns something like that:
 *   {
 *     preview: 'preview_scaled.jpg',
 *     title: 'Pano from Loki Schmidt Garten',
 *     description: '...',
 *     alt: 'Panorama preview',
 *   }
 */
function readHtmlMetaData(htmlFilePath) {

  const metas = readMetaData(htmlFilePath);
  let preview = metas['og:image'].replace(/\{\{.*}}/, "");
  if (preview.startsWith('/')) {
    preview = preview.slice(1);
  }

  return {
    preview: preview,
    title: metas['og:title'],
    description: metas['og:description'],
    alt: metas['og:alt']
  }
}

function scanPanoDir(dir) {

  for (let name of [INDEX_P_TEMPLATE_HTML, INDEX_M_TEMPLATE_HTML, INDEX_P_HTML,
    INDEX_M_HTML]) {
    let htmlFilePath = path.join(dir, name);
    if (fs.existsSync(htmlFilePath)) {
      const htmlData = readHtmlMetaData(htmlFilePath);
      const descData = readDescriptionData(
          path.resolve(dir, 'pano.description.json'))
      let link = path.posix.relative(publicPath, dir);
      const panoItem = {
        preview: htmlData.preview,
        title: descData.title || htmlData.title,
        description: descData.description || htmlData.description,
        alt: htmlData.alt,
        link: link,
        tags: descData.tags
      };

      const preview = panoItem.preview
      if (link && preview) {
        panoItem.absPreview = path.posix.join(link, preview);
      }

      if (preview) {
        const height = 150;
        const scaled = downscale(path.join(dir, preview), height);
        if (scaled) {
          panoItem['scaledPreviewLink' + height] = path.posix.join(link,
              scaled);
        }
      }

      return panoItem
    }
  }
  return null;
}

function scanDir(dir) {
  debug('scanDir', dir)
  const fileNames = fs.readdirSync(dir);

  // is Leaf -> stop
  if (isLeafDirectory(fileNames)) {
    debug('  -> leaf')
    const panoItem = scanPanoDir(dir);
    return panoItem ? [panoItem] : [];
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
