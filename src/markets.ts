import { HttpClient } from "./http-client";

export type MarketSymbol = "USDT-NGN" | "USDC-NGN" | "USD-NGN";
export type MarketStatus = "active" | "suspended" | "maintenance";
export type MarketTradeSide = "buy" | "sell";

export interface Market {
  id: string;
  symbol: string;
  base_asset: string;
  quote_asset: string;
  status: MarketStatus;
  created_at: string;
  updated_at: string;
}

export interface OrderbookLevel {
  price: string;
  quantity: string;
}

export interface OrderbookStats {
  best_bid: string;
  best_ask: string;
  spread: string;
  spread_percent: string;
  mid_price: string;
}

export interface Orderbook {
  symbol: string;
  market_id: string;
  base_asset: string;
  quote_asset: string;
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
  stats: OrderbookStats;
  depth: number;
  timestamp: string;
}

export interface GetOrderbookOptions {
  /** Number of price levels to return. Defaults to 20; accepted range is 1–100. */
  depth?: number;
}

export interface LastPrice {
  symbol: string;
  price: number;
  change_24h: number;
}

export interface MarketTrade {
  id: string;
  symbol: string;
  price: string;
  quantity: string;
  side: MarketTradeSide;
  created_at: string;
}

export interface ListMarketTradesOptions {
  /** Maximum trades to return. Defaults to 50; accepted range is 1–100. */
  limit?: number;
}

export class Markets {
  constructor(private readonly client: HttpClient) {}

  /** Retrieve all available trading markets. */
  list(): Promise<Market[]> {
    return this.client.request<Market[]>("markets", { authenticated: false });
  }

  /** Retrieve one market by trading-pair symbol. */
  get(symbol: MarketSymbol): Promise<Market> {
    return this.client.request<Market>(`markets/${encodeURIComponent(symbol)}`, {
      authenticated: false
    });
  }

  /** Retrieve the current market depth for a trading pair. */
  getOrderbook(symbol: MarketSymbol, options: GetOrderbookOptions = {}): Promise<Orderbook> {
    return this.client.request<Orderbook>(`orderbook/${encodeURIComponent(symbol)}`, {
      authenticated: false,
      query: { depth: options.depth }
    });
  }

  /** Retrieve the most recent trade price and 24-hour percentage change. */
  getLastPrice(symbol: MarketSymbol): Promise<LastPrice> {
    return this.client.request<LastPrice>(`last-price/${encodeURIComponent(symbol)}`, {
      authenticated: false
    });
  }

  /** Retrieve recent anonymous, market-wide trades in reverse chronological order. */
  listTrades(symbol: MarketSymbol, options: ListMarketTradesOptions = {}): Promise<MarketTrade[]> {
    return this.client.request<MarketTrade[]>(`market-trades/${encodeURIComponent(symbol)}`, {
      authenticated: false,
      query: { limit: options.limit }
    });
  }
}
