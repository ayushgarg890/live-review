const logger = require("../middlewares/logger");

require("./server").server().then(server => {
  logger.info(process.env.MONGO_URL)
  logger.info("server started")
});