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
  apiKey: process.env.DAYA_PRO_API_KEY
});

const markets = await daya.markets.list();
const market = await daya.markets.get("USDT-NGN");
const orderbook = await daya.markets.getOrderbook("USDT-NGN", { depth: 10 });
const lastPrice = await daya.markets.getLastPrice("USDT-NGN");
const recentTrades = await daya.markets.listTrades("USDT-NGN", { limit: 20 });
```

Markets endpoints are public, so these calls do not require an API key. Account and trading endpoints will require one.

## Development

```bash
npm install
npm run check
```
