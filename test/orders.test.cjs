const assert = require("node:assert/strict");

const { DayaPro } = require("../dist/index.cjs");

function jsonResponse(data) {
  return {
    ok: true,
    status: 200,
    text: async () => JSON.stringify({ success: true, message: "OK", data }),
  };
}

async function testPlaceAndQuote() {
  const calls = [];
  const sdk = new DayaPro({
    apiKey: "daya_sk_trade",
    fetch: async (url, init) => {
      calls.push({ url: String(url), init });
      return jsonResponse(
        String(url).endsWith("/quote")
          ? { estimated_price: "1545.50" }
          : { order_id: "order-1" },
      );
    },
  });

  const placed = await sdk.orders.place({
    symbol: "USDT-NGN",
    side: "buy",
    type: "market",
    quantity: "100.00",
  });
  const quote = await sdk.orders.quote({
    symbol: "USD-NGN",
    side: "sell",
    type: "limit",
    price: "1550.00",
    quantity: "50.00",
  });

  assert.equal(calls[0].url, "https://api.pro.daya.co/public/v1/orders");
  assert.equal(calls[0].init.method, "POST");
  assert.equal(calls[0].init.headers["X-Api-Key"], "daya_sk_trade");
  assert.deepEqual(JSON.parse(calls[0].init.body), {
    symbol: "USDT-NGN",
    side: "buy",
    type: "market",
    quantity: "100.00",
  });
  assert.equal(calls[1].url, "https://api.pro.daya.co/public/v1/orders/quote");
  assert.equal(JSON.parse(calls[1].init.body).price, "1550.00");
  assert.equal(placed.order_id, "order-1");
  assert.equal(quote.estimated_price, "1545.50");
}

async function testLists() {
  const urls = [];
  const sdk = new DayaPro({
    apiKey: "daya_sk_read",
    fetch: async (url) => {
      urls.push(String(url));
      return jsonResponse(urls.length === 1 ? [] : { orders: [], total_count: 0 });
    },
  });

  await sdk.orders.listActive({ symbol: "USDT-NGN", status: "open" });
  const history = await sdk.orders.history({
    status: "filled",
    symbol: "USD-NGN",
    side: "buy",
    type: "limit",
    start_time: "2024-01-01T00:00:00Z",
    end_time: "2024-12-31T23:59:59Z",
    limit: 20,
    offset: 40,
  });

  assert.equal(
    urls[0],
    "https://api.pro.daya.co/public/v1/orders?symbol=USDT-NGN&status=open",
  );
  assert.equal(
    urls[1],
    "https://api.pro.daya.co/public/v1/orders/history?status=filled&symbol=USD-NGN&side=buy&type=limit&start_time=2024-01-01T00%3A00%3A00Z&end_time=2024-12-31T23%3A59%3A59Z&limit=20&offset=40",
  );
  assert.equal(history.total_count, 0);
}

async function testGetReplaceAndCancel() {
  const calls = [];
  const sdk = new DayaPro({
    apiKey: "daya_sk_trade",
    fetch: async (url, init) => {
      calls.push({ url: String(url), init });
      return jsonResponse(init.method === "DELETE" ? null : { id: "replacement-1" });
    },
  });

  await sdk.orders.get("order/with spaces");
  const replacement = await sdk.orders.replace("order-1", {
    side: "buy",
    type: "limit",
    price: "1550.00",
    quantity: "120.00",
  });
  const cancelled = await sdk.orders.cancel("replacement-1");

  assert.equal(
    calls[0].url,
    "https://api.pro.daya.co/public/v1/orders/order%2Fwith%20spaces",
  );
  assert.equal(calls[1].init.method, "PUT");
  assert.deepEqual(JSON.parse(calls[1].init.body), {
    side: "buy",
    type: "limit",
    price: "1550.00",
    quantity: "120.00",
  });
  assert.equal(calls[2].init.method, "DELETE");
  assert.equal(replacement.id, "replacement-1");
  assert.equal(cancelled, null);
}

async function main() {
  await testPlaceAndQuote();
  await testLists();
  await testGetReplaceAndCancel();
  process.stdout.write("3 Orders tests passed\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
