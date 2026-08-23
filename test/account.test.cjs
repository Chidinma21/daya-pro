const assert = require("node:assert/strict");

const { DayaPro } = require("../dist/index.cjs");

function jsonResponse(data) {
  return {
    ok: true,
    status: 200,
    text: async () => JSON.stringify({ success: true, message: "OK", data }),
  };
}

async function testRequiresApiKey() {
  const sdk = new DayaPro({ fetch: async () => jsonResponse({}) });

  await assert.rejects(
    sdk.account.get(),
    (error) =>
      error.message === "An apiKey is required for this Daya Pro endpoint.",
  );
}

async function testGetAccount() {
  let receivedUrl;
  let receivedInit;
  const sdk = new DayaPro({
    apiKey: "daya_sk_test",
    fetch: async (url, init) => {
      receivedUrl = String(url);
      receivedInit = init;
      return jsonResponse({
        id: "account-1",
        status: "active",
        trading_enabled: true,
      });
    },
  });

  const account = await sdk.account.get();

  assert.equal(receivedUrl, "https://api.pro.daya.co/public/v1/account");
  assert.equal(receivedInit.headers["X-Api-Key"], "daya_sk_test");
  assert.equal(account.id, "account-1");
}

async function testGetBalances() {
  let receivedUrl;
  const sdk = new DayaPro({
    apiKey: "daya_sk_test",
    fetch: async (url) => {
      receivedUrl = String(url);
      return jsonResponse({
        balances: [{ currency: "USD", available_balance: "1000.00" }],
      });
    },
  });

  const result = await sdk.account.getBalances();

  assert.equal(receivedUrl, "https://api.pro.daya.co/public/v1/balances");
  assert.equal(result.balances[0].currency, "USD");
}

async function testGetBalance() {
  let receivedUrl;
  const sdk = new DayaPro({
    apiKey: "daya_sk_test",
    fetch: async (url) => {
      receivedUrl = String(url);
      return jsonResponse({ currency: "NGN", available_balance: "1545000.00" });
    },
  });

  const balance = await sdk.account.getBalance("NGN");

  assert.equal(receivedUrl, "https://api.pro.daya.co/public/v1/balances/NGN");
  assert.equal(balance.currency, "NGN");
}

async function main() {
  await testRequiresApiKey();
  await testGetAccount();
  await testGetBalances();
  await testGetBalance();
  process.stdout.write("4 Account tests passed\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
