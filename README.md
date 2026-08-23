# Daya Pro

A small TypeScript SDK for the [Daya Pro API](https://docs.daya.co/pro/overview).

## Requirements

- Node.js 18 or newer

## Install

```bash
npm install daya-pro
```

## Usage

```ts
import { DayaPro } from "daya-pro";

const daya = new DayaPro({
  apiKey: process.env.DAYA_PRO_API_KEY,
});

const markets = await daya.markets.list();
const market = await daya.markets.get("USDT-NGN");
const orderbook = await daya.markets.getOrderbook("USDT-NGN", { depth: 10 });
const lastPrice = await daya.markets.getLastPrice("USDT-NGN");
const recentTrades = await daya.markets.listTrades("USDT-NGN", { limit: 20 });

const account = await daya.account.get();
const balances = await daya.account.getBalances();
const usdBalance = await daya.account.getBalance("USD");

const quote = await daya.orders.quote({
  symbol: "USDT-NGN",
  side: "buy",
  type: "market",
  quantity: "100.00",
});

const placedOrder = await daya.orders.place({
  symbol: "USDT-NGN",
  side: "buy",
  type: "limit",
  price: "1545.00",
  quantity: "100.00",
});

const activeOrders = await daya.orders.listActive({ symbol: "USDT-NGN" });
const orderHistory = await daya.orders.history({ status: "filled", limit: 20 });
const order = await daya.orders.get(placedOrder.order_id);
const replacement = await daya.orders.replace(order.id, {
  side: "buy",
  type: "limit",
  price: "1550.00",
  quantity: "120.00",
});
await daya.orders.cancel(replacement.id);

const trades = await daya.trades.list({ symbol: "USDT-NGN", limit: 20 });
const trade = await daya.trades.get(trades[0].id);
const orderTrades = await daya.trades.listForOrder(placedOrder.order_id);

const depositAddresses = await daya.deposits.listAddresses();
const completedDeposits = await daya.deposits.listCompleted({
  from: "2026-05-01",
  limit: 20,
});

const withdrawalOptions = await daya.withdrawals.listOnchainOptions();

const onchainWithdrawal = await daya.withdrawals.withdrawOnchain({
  idempotency_key: "onchain-wd-001",
  asset: "USDT",
  amount: "25.505555",
  blockchain: "polygon",
  to_address: "0x1234567890abcdef",
});

const bankWithdrawal = await daya.withdrawals.withdrawToBank({
  idempotency_key: "bank-wd-001",
  amount: "1000000.00",
  currency: "NGN",
  bank_account_id: "saved-beneficiary-id",
});

const webhook = await daya.webhooks.create({
  url: "https://example.com/webhooks/daya",
  events: ["order.filled", "trade.executed"],
  description: "Trading notifications",
});

// Save this securely. It is only returned when created or rotated.
const webhookSecret = webhook.secret;

const webhooks = await daya.webhooks.list();
const deliveryLogs = await daya.webhooks.listDeliveries(webhook.id, {
  limit: 20,
});
```

Markets endpoints are public. Account and order-reading endpoints require Read scope. Quoting, placing, replacing, and cancelling orders require Trade scope.
Withdrawal endpoints require Trade scope. Webhook management requires Write scope.

## Development

```bash
npm install
npm run check
```
