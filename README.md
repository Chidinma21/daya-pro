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
```

The API key is optional for public market endpoints. Account and trading endpoints will require it.

## Development

```bash
npm install
npm run check
```
