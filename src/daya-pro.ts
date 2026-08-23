import { Account } from "./account";
import { DEFAULT_BASE_URL } from "./constants";
import { Deposits } from "./deposits";
import { HttpClient } from "./http-client";
import { Markets } from "./markets";
import { Orders } from "./orders";
import { Trades } from "./trades";
import type { DayaProConfig } from "./types";
import { Withdrawals } from "./withdrawals";

export class DayaPro {
  readonly client: HttpClient;
  readonly markets: Markets;
  readonly account: Account;
  readonly orders: Orders;
  readonly trades: Trades;
  readonly deposits: Deposits;
  readonly withdrawals: Withdrawals;

  constructor(config: DayaProConfig = {}) {
    this.client = new HttpClient({
      ...config,
      baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
    });
    this.markets = new Markets(this.client);
    this.account = new Account(this.client);
    this.orders = new Orders(this.client);
    this.trades = new Trades(this.client);
    this.deposits = new Deposits(this.client);
    this.withdrawals = new Withdrawals(this.client);
  }
}
