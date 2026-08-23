const assert = require("node:assert/strict");

const {
  DayaPro,
  DayaProError,
  DEFAULT_BASE_URL,
} = require("../dist/index.cjs");

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  };
}

async function testPublicRequest() {
  let receivedUrl;
  const sdk = new DayaPro({
    fetch: async (url) => {
      receivedUrl = String(url);
      return jsonResponse({
        success: true,
        message: "Markets retrieved successfully",
        data: [{ symbol: "USDT-NGN" }],
        timestamp: "2024-01-15T10:30:00Z",
      });
    },
  });

  const data = await sdk.client.request("markets", { authenticated: false });

  assert.equal(receivedUrl, `${DEFAULT_BASE_URL}/markets`);
  assert.deepEqual(data, [{ symbol: "USDT-NGN" }]);
}

async function testAuthenticatedRequest() {
  let receivedInit;
  const sdk = new DayaPro({
    apiKey: "daya_sk_test",
    fetch: async (_url, init) => {
      receivedInit = init;
      return jsonResponse({
        success: true,
        message: "OK",
        data: { id: "order-1" },
        timestamp: "2024-01-15T10:30:00Z",
      });
    },
  });

  await sdk.client.request("orders", { method: "POST", body: { side: "buy" } });

  assert.equal(receivedInit.headers["X-Api-Key"], "daya_sk_test");
  assert.equal(receivedInit.headers["Content-Type"], "application/json");
  assert.equal(receivedInit.body, JSON.stringify({ side: "buy" }));
}

async function testApiError() {
  const sdk = new DayaPro({
    apiKey: "daya_sk_test",
    fetch: async () =>
      jsonResponse(
        {
          success: false,
          message: "Unauthorized",
          error: {
            code: "API_KEY_INVALID",
            message: "Invalid or missing API key",
          },
        },
        401,
      ),
  });

  await assert.rejects(
    sdk.client.request("orders"),
    (error) =>
      error instanceof DayaProError &&
      error.status === 401 &&
      error.code === "API_KEY_INVALID",
  );
}

async function main() {
  await testPublicRequest();
  await testAuthenticatedRequest();
  await testApiError();
  process.stdout.write("3 tests passed\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
