const assert = require("node:assert/strict");

const { DayaPro } = require("../dist/index.cjs");

function jsonResponse(data) {
  return {
    ok: true,
    status: 200,
    text: async () => JSON.stringify({ success: true, message: "OK", data }),
  };
}

async function testListAndGetMarkets() {
  const urls = [];
  const sdk = new DayaPro({
    baseUrl: "https://example.test/public/v1/",
    fetch: async (url) => {
      urls.push(String(url));
      return jsonResponse({ symbol: "USD-NGN" });
    },
  });

  await sdk.markets.list();
  await sdk.markets.get("USDT-NGN");

  assert.deepEqual(urls, [
    "https://example.test/public/v1/markets",
    "https://example.test/public/v1/markets/USDT-NGN",
  ]);
}

async function testOrderbook() {
  let receivedUrl;
  const sdk = new DayaPro({
    fetch: async (url) => {
      receivedUrl = String(url);
      return jsonResponse({ bids: [], asks: [], depth: 10 });
    },
  });

  await sdk.markets.getOrderbook("USDC-NGN", { depth: 10 });

  assert.equal(
    receivedUrl,
    "https://api.pro.daya.co/public/v1/orderbook/USDC-NGN?depth=10",
  );
}

async function testLastPrice() {
  let receivedUrl;
  const sdk = new DayaPro({
    fetch: async (url) => {
      receivedUrl = String(url);
      return jsonResponse({
        symbol: "USD-NGN",
        price: 1545.5,
        change_24h: 0.35,
      });
    },
  });

  const result = await sdk.markets.getLastPrice("USD-NGN");

  assert.equal(
    receivedUrl,
    "https://api.pro.daya.co/public/v1/last-price/USD-NGN",
  );
  assert.equal(result.price, 1545.5);
}

async function testMarketTrades() {
  let receivedUrl;
  let receivedInit;
  const sdk = new DayaPro({
    fetch: async (url, init) => {
      receivedUrl = String(url);
      receivedInit = init;
      return jsonResponse([{ id: "trade-1", side: "buy" }]);
    },
  });

  const result = await sdk.markets.listTrades("USDT-NGN", { limit: 20 });

  assert.equal(
    receivedUrl,
    "https://api.pro.daya.co/public/v1/market-trades/USDT-NGN?limit=20",
  );
  assert.equal(receivedInit.headers["X-Api-Key"], undefined);
  assert.equal(result[0].id, "trade-1");
}

async function main() {
  await testListAndGetMarkets();
  await testOrderbook();
  await testLastPrice();
  await testMarketTrades();
  process.stdout.write("4 Markets tests passed\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
