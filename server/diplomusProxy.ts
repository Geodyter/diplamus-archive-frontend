/**
 * DiPlaMus Archive API Proxy
 * Forwards requests from the browser to archive.diplamus.app-host.eu
 * to bypass CORS restrictions.
 *
 * Route: /api/diplamus-proxy/*  →  https://archive.diplamus.app-host.eu/api/v1/*
 */
import type { Express, Request, Response } from "express";

const DIPLAMUS_BASE = "https://archive.diplamus.app-host.eu/api/v1";
const API_KEY = process.env.DIPLAMUS_API_KEY || "uinFayPObwYkqt8t8YTIDceq/1sMFnHbi08mavaS3W0=";

export function registerDiplamousProxy(app: Express) {
  app.use("/api/diplamus-proxy", async (req: Request, res: Response) => {
    // Build target URL: strip /api/diplamus-proxy prefix, keep the rest
    const targetPath = req.path; // e.g. /tours, /navigation_points/5
    const queryString = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
    const targetUrl = `${DIPLAMUS_BASE}${targetPath}${queryString}`;

    try {
      const upstream = await fetch(targetUrl, {
        method: req.method,
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "X-API-Authorization": API_KEY,
        },
        // Forward body for POST/PUT/PATCH
        body: ["POST", "PUT", "PATCH"].includes(req.method)
          ? JSON.stringify(req.body)
          : undefined,
      });

      const contentType = upstream.headers.get("content-type") || "application/json";
      const body = await upstream.text();

      res.status(upstream.status)
        .set("Content-Type", contentType)
        .set("Cache-Control", "public, max-age=60") // light caching
        .send(body);
    } catch (err) {
      console.error("[DiPlaMus Proxy] Error:", err);
      res.status(502).json({ error: true, message: "Proxy error: upstream unreachable" });
    }
  });
}
