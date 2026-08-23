const assert = require("node:assert/strict");

const { DayaPro } = require("../dist/index.cjs");

function jsonResponse(data) {
  return {
    ok: true,
    status: 200,
    text: async () => JSON.stringify({ success: true, message: "OK", data }),
  };
}

async function testListOnchainOptions() {
  let receivedUrl;
  let receivedInit;
  const sdk = new DayaPro({
    apiKey: "daya_sk_read",
    fetch: async (url, init) => {
      receivedUrl = String(url);
      receivedInit = init;
      return jsonResponse({
        assets: [{ asset: "USDT", chains: [{ blockchain: "polygon" }] }],
      });
    },
  });

  const result = await sdk.withdrawals.listOnchainOptions();

  assert.equal(
    receivedUrl,
    "https://api.pro.daya.co/public/v1/withdrawals/onchain/options",
  );
  assert.equal(receivedInit.headers["X-Api-Key"], "daya_sk_read");
  assert.equal(result.assets[0].chains[0].blockchain, "polygon");
}

async function testWithdrawOnchain() {
  let receivedUrl;
  let receivedInit;
  const sdk = new DayaPro({
    apiKey: "daya_sk_trade",
    fetch: async (url, init) => {
      receivedUrl = String(url);
      receivedInit = init;
      return jsonResponse({
        transaction_id: "withdrawal-1",
        status: "processing",
      });
    },
  });
  const input = {
    idempotency_key: "onchain-wd-001",
    asset: "USDT",
    amount: "25.505555",
    blockchain: "polygon",
    to_address: "0x1234567890abcdef",
  };

  const result = await sdk.withdrawals.withdrawOnchain(input);

  assert.equal(
    receivedUrl,
    "https://api.pro.daya.co/public/v1/withdrawals/onchain",
  );
  assert.equal(receivedInit.method, "POST");
  assert.deepEqual(JSON.parse(receivedInit.body), input);
  assert.equal(result.status, "processing");
}

async function testWithdrawToBank() {
  const bodies = [];
  const sdk = new DayaPro({
    apiKey: "daya_sk_trade",
    fetch: async (url, init) => {
      assert.equal(
        String(url),
        "https://api.pro.daya.co/public/v1/withdrawals/bank",
      );
      bodies.push(JSON.parse(init.body));
      return jsonResponse({
        transaction_id: "withdrawal-2",
        status: "processing",
      });
    },
  });

  await sdk.withdrawals.withdrawToBank({
    idempotency_key: "bank-wd-001",
    amount: "1000000.00",
    currency: "NGN",
    account_number: "0123456789",
    bank_code: "058",
    account_name: "Jane Doe",
    bank_name: "GTBank",
    narration: "Invoice 123",
  });
  await sdk.withdrawals.withdrawToBank({
    idempotency_key: "bank-wd-002",
    amount: "500000.00",
    currency: "NGN",
    bank_account_id: "saved-beneficiary-1",
  });

  assert.equal(bodies[0].account_number, "0123456789");
  assert.equal(bodies[1].bank_account_id, "saved-beneficiary-1");
  assert.equal(bodies[1].account_number, undefined);
}

async function main() {
  await testListOnchainOptions();
  await testWithdrawOnchain();
  await testWithdrawToBank();
  process.stdout.write("3 Withdrawals tests passed\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
