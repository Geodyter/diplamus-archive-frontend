import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import { registerDiplamousProxy } from "./diplomusProxy";
import request from "supertest";

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function createApp() {
  const app = express();
  app.use(express.json());
  registerDiplamousProxy(app);
  return app;
}

describe("DiPlaMus Proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forwards GET /api/diplamus-proxy/periods to upstream and returns 200", async () => {
    const mockData = { error: false, data: [{ id: 1, name: "Test Period" }], meta: { total: 1 } };
    mockFetch.mockResolvedValueOnce({
      status: 200,
      headers: { get: () => "application/json" },
      text: async () => JSON.stringify(mockData),
    });

    const app = createApp();
    const res = await request(app).get("/api/diplamus-proxy/periods");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe("Test Period");

    // Verify upstream URL
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("archive.diplamus.app-host.eu/api/v1/periods"),
      expect.objectContaining({
        headers: expect.objectContaining({ "X-API-Authorization": expect.any(String) }),
      })
    );
  });

  it("forwards query params to upstream", async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      headers: { get: () => "application/json" },
      text: async () => JSON.stringify({ data: [] }),
    });

    const app = createApp();
    await request(app).get("/api/diplamus-proxy/materials?pageSize=5&page=2");

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain("pageSize=5");
    expect(calledUrl).toContain("page=2");
  });

  it("returns 502 when upstream is unreachable", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const app = createApp();
    const res = await request(app).get("/api/diplamus-proxy/tours");

    expect(res.status).toBe(502);
    expect(res.body.error).toBe(true);
  });
});
