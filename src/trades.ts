import { HttpClient } from "./http-client";
import type { MarketSymbol } from "./markets";
import type { OrderSide } from "./orders";

export interface Trade {
  id: string;
  symbol: string;
  side: OrderSide;
  order_id: string;
  price: string;
  quantity: string;
  total_value: string;
  fee: string;
  is_maker: boolean;
  created_at: string;
}

export interface ListTradesOptions {
  symbol?: MarketSymbol;
  order_id?: string;
  /** Defaults to 50; accepted range is 1–100. */
  limit?: number;
  /** Number of trades to skip. Defaults to 0. */
  offset?: number;
}

export class Trades {
  constructor(private readonly client: HttpClient) {}

  /** List the authenticated user's trade fills. Requires Read or Trade scope. */
  list(options: ListTradesOptions = {}): Promise<Trade[]> {
    return this.client.request<Trade[]>("trades", {
      query: {
        symbol: options.symbol,
        order_id: options.order_id,
        limit: options.limit,
        offset: options.offset,
      },
    });
  }

  /** Retrieve one trade belonging to the authenticated user. */
  get(tradeId: string): Promise<Trade> {
    return this.client.request<Trade>(`trades/${encodeURIComponent(tradeId)}`);
  }

  /** List all trade fills associated with one order. */
  listForOrder(orderId: string): Promise<Trade[]> {
    return this.client.request<Trade[]>(
      `orders/${encodeURIComponent(orderId)}/trades`,
    );
  }
}
