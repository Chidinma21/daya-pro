const assert = require("node:assert/strict");

const { DayaPro } = require("../dist/index.cjs");

function jsonResponse(data) {
  return {
    ok: true,
    status: 200,
    text: async () => JSON.stringify({ success: true, message: "OK", data }),
  };
}

async function testListTrades() {
  let receivedUrl;
  let receivedInit;
  const sdk = new DayaPro({
    apiKey: "daya_sk_read",
    fetch: async (url, init) => {
      receivedUrl = String(url);
      receivedInit = init;
      return jsonResponse([{ id: "trade-1", fee: "0.15455000" }]);
    },
  });

  const trades = await sdk.trades.list({
    symbol: "USDT-NGN",
    order_id: "order-1",
    limit: 20,
    offset: 40,
  });

  assert.equal(
    receivedUrl,
    "https://api.pro.daya.co/public/v1/trades?symbol=USDT-NGN&order_id=order-1&limit=20&offset=40",
  );
  assert.equal(receivedInit.headers["X-Api-Key"], "daya_sk_read");
  assert.equal(trades[0].fee, "0.15455000");
}

async function testGetTrade() {
  let receivedUrl;
  const sdk = new DayaPro({
    apiKey: "daya_sk_read",
    fetch: async (url) => {
      receivedUrl = String(url);
      return jsonResponse({ id: "trade-1", is_maker: false });
    },
  });

  const trade = await sdk.trades.get("trade/with spaces");

  assert.equal(
    receivedUrl,
    "https://api.pro.daya.co/public/v1/trades/trade%2Fwith%20spaces",
  );
  assert.equal(trade.is_maker, false);
}

async function testListOrderTrades() {
  let receivedUrl;
  const sdk = new DayaPro({
    apiKey: "daya_sk_read",
    fetch: async (url) => {
      receivedUrl = String(url);
      return jsonResponse([{ id: "trade-1", order_id: "order-1" }]);
    },
  });

  const trades = await sdk.trades.listForOrder("order-1");

  assert.equal(
    receivedUrl,
    "https://api.pro.daya.co/public/v1/orders/order-1/trades",
  );
  assert.equal(trades[0].order_id, "order-1");
}

async function main() {
  await testListTrades();
  await testGetTrade();
  await testListOrderTrades();
  process.stdout.write("3 Trades tests passed\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
