/**
 * DiPlaMus Archive API + Storage Proxy
 * Forwards requests from the browser to archive.diplamus.app-host.eu
 * to bypass CORS restrictions.
 *
 * Routes:
 *   /api/diplamus-proxy/*  →  https://archive.diplamus.app-host.eu/api/v1/*
 *   /diplamus-storage/*    →  https://archive.diplamus.app-host.eu/storage/*
 */
import type { Express, Request, Response } from "express";

const DIPLAMUS_BASE = "https://archive.diplamus.app-host.eu/api/v1";
const DIPLAMUS_STORAGE = "https://archive.diplamus.app-host.eu/storage";
const API_KEY = process.env.DIPLAMUS_API_KEY || "uinFayPObwYkqt8t8YTIDceq/1sMFnHbi08mavaS3W0=";

export function registerDiplamousProxy(app: Express) {
  // ── API proxy ──
  app.use("/api/diplamus-proxy", async (req: Request, res: Response) => {
    const targetPath = req.path;
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
        body: ["POST", "PUT", "PATCH"].includes(req.method)
          ? JSON.stringify(req.body)
          : undefined,
      });

      const contentType = upstream.headers.get("content-type") || "application/json";
      const body = await upstream.text();

      res.status(upstream.status)
        .set("Content-Type", contentType)
        .set("Access-Control-Allow-Origin", "*")
        .set("Cache-Control", "public, max-age=60")
        .send(body);
    } catch (err) {
      console.error("[DiPlaMus API Proxy] Error:", err);
      res.status(502).json({ error: true, message: "Proxy error: upstream unreachable" });
    }
  });

  // ── Storage proxy (for GLB, images, videos) ──
  app.use("/diplamus-storage", async (req: Request, res: Response) => {
    const targetPath = req.path;
    const targetUrl = `${DIPLAMUS_STORAGE}${targetPath}`;

    try {
      const upstream = await fetch(targetUrl, {
        method: "GET",
        headers: {
          "X-API-Authorization": API_KEY,
        },
      });

      if (!upstream.ok) {
        res.status(upstream.status).send("Not found");
        return;
      }

      const contentType = upstream.headers.get("content-type") || "application/octet-stream";
      const contentLength = upstream.headers.get("content-length");

      res.status(200)
        .set("Content-Type", contentType)
        .set("Access-Control-Allow-Origin", "*")
        .set("Cache-Control", "public, max-age=3600");

      if (contentLength) {
        res.set("Content-Length", contentLength);
      }

      // Stream the response
      const buffer = await upstream.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (err) {
      console.error("[DiPlaMus Storage Proxy] Error:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}
