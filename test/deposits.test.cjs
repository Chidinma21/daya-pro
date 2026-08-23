const assert = require("node:assert/strict");

const { DayaPro } = require("../dist/index.cjs");

function jsonResponse(data) {
  return {
    ok: true,
    status: 200,
    text: async () => JSON.stringify({ success: true, message: "OK", data }),
  };
}

async function testListAddresses() {
  let receivedUrl;
  let receivedInit;
  const sdk = new DayaPro({
    apiKey: "daya_sk_read",
    fetch: async (url, init) => {
      receivedUrl = String(url);
      receivedInit = init;
      return jsonResponse({
        assets: [{ asset: "USDT", chains: [{ blockchain: "ethereum" }] }],
      });
    },
  });

  const result = await sdk.deposits.listAddresses();

  assert.equal(
    receivedUrl,
    "https://api.pro.daya.co/public/v1/deposits/addresses",
  );
  assert.equal(receivedInit.headers["X-Api-Key"], "daya_sk_read");
  assert.equal(result.assets[0].chains[0].blockchain, "ethereum");
}

async function testListCompleted() {
  let receivedUrl;
  const sdk = new DayaPro({
    apiKey: "daya_sk_read",
    fetch: async (url) => {
      receivedUrl = String(url);
      return jsonResponse({
        deposits: [{ id: "deposit-1", status: "completed" }],
        pagination: { total: 1, limit: 20, offset: 0, has_next: false },
      });
    },
  });

  const result = await sdk.deposits.listCompleted({
    limit: 20,
    offset: 40,
    from: "2026-05-01",
    to: "2026-05-31T23:59:59Z",
  });

  assert.equal(
    receivedUrl,
    "https://api.pro.daya.co/public/v1/deposits/completed?limit=20&offset=40&from=2026-05-01&to=2026-05-31T23%3A59%3A59Z",
  );
  assert.equal(result.deposits[0].id, "deposit-1");
  assert.equal(result.pagination.has_next, false);
}

async function main() {
  await testListAddresses();
  await testListCompleted();
  process.stdout.write("2 Deposits tests passed\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
