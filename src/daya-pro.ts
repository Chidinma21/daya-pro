import { Account } from "./account";
import { DEFAULT_BASE_URL } from "./constants";
import { HttpClient } from "./http-client";
import { Markets } from "./markets";
import { Orders } from "./orders";
import type { DayaProConfig } from "./types";

export class DayaPro {
  readonly client: HttpClient;
  readonly markets: Markets;
  readonly account: Account;
  readonly orders: Orders;

  constructor(config: DayaProConfig = {}) {
    this.client = new HttpClient({
      ...config,
      baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
    });
    this.markets = new Markets(this.client);
    this.account = new Account(this.client);
    this.orders = new Orders(this.client);
  }
}
