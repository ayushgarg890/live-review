const morgan = require("morgan");
const logger = require("./logger");

const morganMiddleware = morgan("combined", {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
});

module.exports = morganMiddleware;
