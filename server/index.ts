import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { registerRoutes } from "./routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const pathReq = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (pathReq.startsWith("/api")) {
      let logLine = `${req.method} ${pathReq} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      console.log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error(err);
  });

  // Serve React frontend (matches Vite's outDir "client/dist")
  const frontendPath = path.resolve(process.cwd(), "client", "dist");
  console.log("Serving frontend from:", frontendPath);

  if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(frontendPath, "index.html"));
    });
  } else {
    console.warn("Frontend build not found at", frontendPath);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  app.listen(port, "0.0.0.0", () => console.log(`Server running on port ${port}`));
})();
