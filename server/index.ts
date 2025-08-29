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
  const originalJson = res.json;
  let captured: any;

  res.json = function (body, ...args) {
    captured = body;
    return originalJson.apply(res, [body, ...args]);
  };

  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      let line = `${req.method} ${req.path} ${res.statusCode} in ${Date.now() - start}ms`;
      if (captured) line += ` :: ${JSON.stringify(captured)}`;
      console.log(line.length > 80 ? line.slice(0, 79) + "…" : line);
    }
  });

  next();
});

(async () => {
  await registerRoutes(app);

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Internal Server Error" });
    console.error(err);
  });

  // Serve frontend
  const frontendPath = path.join(process.cwd(), "client", "dist");
  console.log("Serving frontend from:", frontendPath);

  if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
    app.get("*", (_req, res) => res.sendFile(path.join(frontendPath, "index.html")));
  } else {
    console.warn("Frontend build not found:", frontendPath);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  app.listen(port, "0.0.0.0", () => console.log(`Server running on port ${port}`));
})();
