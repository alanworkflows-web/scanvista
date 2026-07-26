const fs = require('fs');
const file = 'server.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('app.get("/api/health/metrics"')) {
  content = content.replace(
    '  // Global Error Handler',
    `  // Health Metrics Endpoint
  app.get("/api/health/metrics", async (req, res) => {
    try {
      const dbStart = performance.now();
      await prisma.$queryRaw\`SELECT 1\`;
      const dbLatency = performance.now() - dbStart;
      
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        metrics: {
          dbLatencyMs: Math.round(dbLatency),
          uptimeSeconds: Math.round(process.uptime()),
          memoryUsage: process.memoryUsage()
        }
      });
    } catch (err) {
      req.log.error({ err }, "Health check failed");
      res.status(503).json({ status: "unhealthy", error: "Database unavailable" });
    }
  });

  // Global Error Handler`
  );
}

fs.writeFileSync(file, content);
console.log('Added health endpoint');
