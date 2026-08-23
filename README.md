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
```

Markets endpoints are public. Account endpoints require an API key with Read scope.

## Development

```bash
npm install
npm run check
```
