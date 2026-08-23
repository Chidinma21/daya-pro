import { HttpClient } from "./http-client";

export type AccountStatus = "active" | "suspended" | "frozen";

export interface AccountDetails {
  id: string;
  email: string;
  name: string;
  status: AccountStatus;
  trading_enabled: boolean;
  created_at: string;
}

export interface Balance {
  currency: string;
  total_balance: string;
  available_balance: string;
  held_balance: string;
  used_credit: string;
  held_credit: string;
  available_credit: string;
  credit_limit: string;
  usd_rate: string;
}

export interface Balances {
  balances: Balance[];
}

export class Account {
  constructor(private readonly client: HttpClient) {}

  /** Retrieve profile and status details for the authenticated account. */
  get(): Promise<AccountDetails> {
    return this.client.request<AccountDetails>("account");
  }

  /** Retrieve balances for all currencies. */
  getBalances(): Promise<Balances> {
    return this.client.request<Balances>("balances");
  }

  /** Retrieve the balance for one currency, such as USD or NGN. */
  getBalance(currency: string): Promise<Balance> {
    return this.client.request<Balance>(
      `balances/${encodeURIComponent(currency)}`,
    );
  }
}
