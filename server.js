const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const fs = require("fs");
const path = require("path");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

// Set up dynamic database URL to avoid permission issues in C:\Program Files
if (!dev) {
  const appDataPath = process.env.APPDATA || (process.platform === 'darwin' ? path.join(process.env.HOME, 'Library', 'Application Support') : path.join(process.env.HOME, '.config'));
  const appFolder = path.join(appDataPath, 'BillingSystem');
  
  if (!fs.existsSync(appFolder)) {
    fs.mkdirSync(appFolder, { recursive: true });
  }
  
  // Prisma requires forward slashes or escaped backslashes for file URLs
  const dbPath = path.join(appFolder, 'dev.db').replace(/\\/g, '/');
  process.env.DATABASE_URL = `file:${dbPath}`;
} else {
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = `file:${path.join(__dirname, 'dev.db').replace(/\\/g, '/')}`;
  }
}

// Initialize the Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  })
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
