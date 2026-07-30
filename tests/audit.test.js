import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
    afterEach
} from "vitest";
import { auditUrl } from "../src/services/audit.services.js";

describe("auditUrl", () => {

    beforeEach(() => {

        vi.stubGlobal(
            "fetch",
            vi.fn()
        );

    });


    afterEach(() => {

        vi.unstubAllGlobals();

    });


    it("audits an HTTPS website successfully", async () => {

        fetch.mockResolvedValue({
            status: 200,

            headers: {
                get: vi.fn((name) => {

                    if (name === "content-type") {
                        return "text/html; charset=UTF-8";
                    }

                    return null;

                })
            }
        });


        const url = new URL(
            "https://example.com"
        );


        const result = await auditUrl(url);


        expect(result.status).toBe(200);

        expect(result.reachable).toBe(true);

        expect(result.https).toBe(true);

        expect(result.redirected).toBe(false);

        expect(result.contentType)
            .toBe("text/html; charset=UTF-8");

    });

});