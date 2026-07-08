import serverModule from '../dist/server.cjs';
const { startServer } = serverModule;

let cachedApp = null;

export default async function handler(req, res) {
  try {
    if (!cachedApp) {
      cachedApp = await startServer();
    }
    return cachedApp(req, res);
  } catch (err) {
    console.error("Serverless Initialization Error:", err);
    res.status(500).json({ error: "Server configuration error", details: err.message });
  }
}
