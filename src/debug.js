const isDebug = process.env.DEBUG || false;

function debug(message, ...optionalParams) {
  if (isDebug) {
    console.log.apply(null, arguments);
  }
}

function error(message, ...optionalParams) {
  if (isDebug) {
    console.error.apply(null, arguments);
  }
}

module.exports = {
  isDebug, debug, error
}
