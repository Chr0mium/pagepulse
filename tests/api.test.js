import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../src/app.js";

describe("PagePulse API", () => {
  it("returns health information", async () => {
    const response = await request(app)
      .get("/health");

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.requestId).toBeDefined();
  });

  it("rejects a missing URL", async () => {
    const response = await request(app)
      .post("/api/v1/audits")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.ok).toBe(false);
    expect(response.body.error.code).toBe("URL_REQUIRED");
    expect(response.body.requestId).toBeDefined();
  });
});