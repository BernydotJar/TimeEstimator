/** @jest-environment node */

import { createServer, type Server } from "node:http";

describe("n8n HTTP contract", () => {
  let server: Server;
  let endpoint: string;
  let receivedBody: Record<string, unknown> | null = null;
  let receivedOperation: string | undefined;

  beforeAll(async () => {
    server = createServer((request, response) => {
      const chunks: Buffer[] = [];
      request.on("data", (chunk: Buffer) => chunks.push(chunk));
      request.on("end", () => {
        receivedOperation = request.headers["x-time-estimator-operation"] as
          | string
          | undefined;
        receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(
          JSON.stringify({
            ok: true,
            data: {
              suggestedEffort: 4.5,
              reasoning: "Validated by the local n8n contract server.",
            },
          }),
        );
      });
    });

    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", resolve);
    });

    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Unable to determine the local contract server port.");
    }

    endpoint = `http://127.0.0.1:${address.port}/webhook/analyze`;
    process.env.NEXT_PUBLIC_N8N_ANALYZE_ESTIMATE_URL = endpoint;
  });

  afterAll(async () => {
    delete process.env.NEXT_PUBLIC_N8N_ANALYZE_ESTIMATE_URL;
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it("exchanges the versioned envelope over a real HTTP connection", async () => {
    const { invokeN8n } = await import("@/lib/n8n-client");

    await expect(
      invokeN8n<{ suggestedEffort: number; reasoning: string }>(
        "analyzeEstimate",
        { activityDescription: "Validate invoices" },
      ),
    ).resolves.toEqual({
      suggestedEffort: 4.5,
      reasoning: "Validated by the local n8n contract server.",
    });

    expect(receivedOperation).toBe("analyzeEstimate");
    expect(receivedBody).toMatchObject({
      version: "1.0",
      operation: "analyzeEstimate",
      input: { activityDescription: "Validate invoices" },
      meta: { source: "time-estimator" },
    });
    expect(receivedBody?.requestId).toEqual(expect.any(String));
  });
});
