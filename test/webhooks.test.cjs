const assert = require("node:assert/strict");

const { DayaPro } = require("../dist/index.cjs");

function jsonResponse(data) {
  return {
    ok: true,
    status: 200,
    text: async () => JSON.stringify({ success: true, message: "OK", data }),
  };
}

async function testListAndCreate() {
  const calls = [];
  const sdk = new DayaPro({
    apiKey: "daya_sk_write",
    fetch: async (url, init) => {
      calls.push({ url: String(url), init });
      return jsonResponse(
        init.method === "POST"
          ? { id: "webhook-1", secret: "secret-1" }
          : [{ id: "webhook-1" }],
      );
    },
  });

  const webhooks = await sdk.webhooks.list();
  const input = {
    url: "https://example.com/webhooks/daya",
    events: ["order.filled", "trade.executed"],
    description: "Trading notifications",
  };
  const created = await sdk.webhooks.create(input);

  assert.equal(calls[0].url, "https://api.pro.daya.co/public/v1/webhooks");
  assert.equal(calls[0].init.headers["X-Api-Key"], "daya_sk_write");
  assert.equal(calls[1].init.method, "POST");
  assert.deepEqual(JSON.parse(calls[1].init.body), input);
  assert.equal(webhooks[0].id, "webhook-1");
  assert.equal(created.secret, "secret-1");
}

async function testGetUpdateAndDelete() {
  const calls = [];
  const sdk = new DayaPro({
    apiKey: "daya_sk_write",
    fetch: async (url, init) => {
      calls.push({ url: String(url), init });
      return jsonResponse(init.method === "DELETE" ? null : { id: "webhook-1" });
    },
  });

  await sdk.webhooks.get("webhook/with spaces");
  await sdk.webhooks.update("webhook-1", {
    events: ["order.filled"],
    status: "paused",
  });
  const deleted = await sdk.webhooks.delete("webhook-1");

  assert.equal(
    calls[0].url,
    "https://api.pro.daya.co/public/v1/webhooks/webhook%2Fwith%20spaces",
  );
  assert.equal(calls[1].init.method, "PATCH");
  assert.deepEqual(JSON.parse(calls[1].init.body), {
    events: ["order.filled"],
    status: "paused",
  });
  assert.equal(calls[2].init.method, "DELETE");
  assert.equal(deleted, null);
}

async function testRotateSecret() {
  let receivedUrl;
  let receivedInit;
  const sdk = new DayaPro({
    apiKey: "daya_sk_write",
    fetch: async (url, init) => {
      receivedUrl = String(url);
      receivedInit = init;
      return jsonResponse({ id: "webhook-1", secret: "new-secret" });
    },
  });

  const webhook = await sdk.webhooks.rotateSecret("webhook-1");

  assert.equal(
    receivedUrl,
    "https://api.pro.daya.co/public/v1/webhooks/webhook-1/rotate-secret",
  );
  assert.equal(receivedInit.method, "POST");
  assert.equal(webhook.secret, "new-secret");
}

async function testListDeliveries() {
  let receivedUrl;
  const sdk = new DayaPro({
    apiKey: "daya_sk_write",
    fetch: async (url) => {
      receivedUrl = String(url);
      return jsonResponse([{ id: "delivery-1", status: "delivered" }]);
    },
  });

  const deliveries = await sdk.webhooks.listDeliveries("webhook-1", {
    limit: 20,
    offset: 40,
  });

  assert.equal(
    receivedUrl,
    "https://api.pro.daya.co/public/v1/webhooks/webhook-1/deliveries?limit=20&offset=40",
  );
  assert.equal(deliveries[0].status, "delivered");
}

async function main() {
  await testListAndCreate();
  await testGetUpdateAndDelete();
  await testRotateSecret();
  await testListDeliveries();
  process.stdout.write("4 Webhooks tests passed\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
