import { describe, expect, it } from "vitest";
import { validateUrl } from "../src/validators/url-validator.js";

describe("URL validation", () => {
  it("accepts an HTTPS URL", () => {
    const result = validateUrl("https://example.com");

    expect(result.valid).toBe(true);
  });

  it("rejects malformed URLs", () => {
    const result = validateUrl("hello");

    expect(result.valid).toBe(false);
    expect(result.code).toBe("INVALID_URL");
  });

  it("rejects FTP URLs", () => {
    const result = validateUrl("ftp://example.com");

    expect(result.valid).toBe(false);
    expect(result.code).toBe("UNSUPPORTED_PROTOCOL");
  });
});