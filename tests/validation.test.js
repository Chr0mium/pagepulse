import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
    afterEach
} from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("POST /api/v1/audits - validation", () => {


    it("rejects a missing URL", async () => {

        const response = await request(app)
            .post("/api/v1/audits")
            .send({});

        expect(response.status).toBe(400);

        expect(response.body.error.code)
            .toBe("URL_REQUIRED");

    });


    it("rejects an invalid URL", async () => {

        const response = await request(app)
            .post("/api/v1/audits")
            .send({
                url: "hello"
            });

        expect(response.status).toBe(400);

        expect(response.body.error.code)
            .toBe("INVALID_URL");

    });


    it("rejects FTP URLs", async () => {

        const response = await request(app)
            .post("/api/v1/audits")
            .send({
                url: "ftp://example.com"
            });

        expect(response.status).toBe(400);

        expect(response.body.error.code)
            .toBe("UNSUPPORTED_PROTOCOL");

    });


    it("accepts a valid HTTPS URL", async () => {

        const fetchMock = vi
            .spyOn(globalThis, "fetch")
            .mockResolvedValue({
                status: 200,

                headers: {
                    get: vi.fn(() => "text/html")
                }
            });

        try {

            const response = await request(app)
                .post("/api/v1/audits")
                .send({
                    url: "https://example.com"
                });

            expect(response.status).toBe(200);
            expect(response.body.ok).toBe(true);

        } finally {

            fetchMock.mockRestore();

        }

    });

});