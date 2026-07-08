const { startServer } = require('../dist/server.cjs');

let cachedApp = null;

module.exports = async (req, res) => {
  if (!cachedApp) {
    // startServer() returns the Express app instance
    cachedApp = await startServer();
  }
  return cachedApp(req, res);
};
