const INDEX_PREFIX = 'index.';
const INDEX_HTML = 'index.html';
const INDEX_TEMPLATE_HTML = 'index.template.html';
const INDEX_M_HTML = 'index.m.html';
const INDEX_M_TEMPLATE_HTML = 'index.m.template.html';
const INDEX_P_HTML = 'index.p.html';
const INDEX_P_TEMPLATE_HTML = 'index.p.template.html';
const INDEX_ALL = [
  INDEX_HTML,
  INDEX_TEMPLATE_HTML,
  INDEX_M_HTML,
  INDEX_M_TEMPLATE_HTML,
  INDEX_P_HTML,
  INDEX_P_TEMPLATE_HTML];

const isDebug = process.env.DEBUG || false;
function debug(message, ...optionalParams) {
  if (isDebug) {
    console.log.apply(null, arguments);
  }
}


module.exports = {
  INDEX_PREFIX,
  INDEX_HTML,
  INDEX_TEMPLATE_HTML,
  INDEX_M_HTML,
  INDEX_M_TEMPLATE_HTML,
  INDEX_P_HTML,
  INDEX_P_TEMPLATE_HTML,
  INDEX_ALL,
  isDebug, debug
}
