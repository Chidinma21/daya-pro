import { HttpClient } from "./http-client";
import type { MarketSymbol } from "./markets";

export type OrderSide = "buy" | "sell";
export type OrderType = "limit" | "market";
export type OrderStatus =
  | "pending_settlement"
  | "new"
  | "open"
  | "partially_filled"
  | "filled"
  | "cancelled"
  | "rejected"
  | "failed";
export type ActiveOrderStatus = "pending_settlement" | "new" | "open" | "partially_filled";
export type HistoricalOrderStatus = "filled" | "cancelled" | "rejected" | "partially_filled";

interface BaseOrderInput {
  symbol: MarketSymbol;
  side: OrderSide;
  quantity: string;
}

export interface LimitOrderInput extends BaseOrderInput {
  type: "limit";
  price: string;
}

export interface MarketOrderInput extends BaseOrderInput {
  type: "market";
  price?: never;
}

export type PlaceOrderInput = LimitOrderInput | MarketOrderInput;
export type OrderQuoteInput = PlaceOrderInput;

interface BaseReplacementInput {
  side: OrderSide;
  quantity: string;
}

export interface LimitReplacementInput extends BaseReplacementInput {
  type: "limit";
  price: string;
}

export interface MarketReplacementInput extends BaseReplacementInput {
  type: "market";
  price?: never;
}

export type ReplaceOrderInput = LimitReplacementInput | MarketReplacementInput;

export interface OrderPlacement {
  order_id: string;
  status: OrderStatus;
  side: OrderSide;
  type: OrderType;
  symbol: string;
  requested_quantity: string;
  filled_quantity: string;
  remaining_quantity: string;
  avg_fill_price: string;
  total_fee_charged: string;
  created_at: string;
  updated_at: string;
}

export interface OrderQuote {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: string;
  estimated_price: string;
  estimated_total: string;
  estimated_fee: string;
}

export interface Order {
  id: string;
  user_id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  status: OrderStatus;
  price: string;
  quantity: string;
  filled_quantity: string;
  remaining_quantity: string;
  executed_price: string;
  total_value: string;
  filled_value: string;
  base_currency: string;
  quote_currency: string;
  created_at: string;
  updated_at: string;
}

export interface ListActiveOrdersOptions {
  symbol?: MarketSymbol;
  status?: ActiveOrderStatus;
}

export interface OrderHistoryOptions {
  status?: HistoricalOrderStatus;
  symbol?: MarketSymbol;
  side?: OrderSide;
  type?: OrderType;
  /** RFC3339 timestamp. */
  start_time?: string;
  /** RFC3339 timestamp. */
  end_time?: string;
  /** Defaults to 50; accepted range is 1–100. */
  limit?: number;
  /** Number of orders to skip. Defaults to 0. */
  offset?: number;
}

export interface OrderHistory {
  orders: Order[];
  total_count: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export class Orders {
  constructor(private readonly client: HttpClient) {}

  /** Place a limit or market order. Requires Trade scope. */
  place(input: PlaceOrderInput): Promise<OrderPlacement> {
    return this.client.request<OrderPlacement>("orders", { method: "POST", body: input });
  }

  /** Preview estimated execution price, total, and fees without placing an order. */
  quote(input: OrderQuoteInput): Promise<OrderQuote> {
    return this.client.request<OrderQuote>("orders/quote", { method: "POST", body: input });
  }

  /** List active orders, optionally filtered by symbol and active status. */
  listActive(options: ListActiveOrdersOptions = {}): Promise<Order[]> {
    return this.client.request<Order[]>("orders", {
      query: { symbol: options.symbol, status: options.status }
    });
  }

  /** List historical orders with filters and offset pagination. */
  history(options: OrderHistoryOptions = {}): Promise<OrderHistory> {
    return this.client.request<OrderHistory>("orders/history", {
      query: {
        status: options.status,
        symbol: options.symbol,
        side: options.side,
        type: options.type,
        start_time: options.start_time,
        end_time: options.end_time,
        limit: options.limit,
        offset: options.offset
      }
    });
  }

  /** Retrieve one order by ID. */
  get(orderId: string): Promise<Order> {
    return this.client.request<Order>(`orders/${encodeURIComponent(orderId)}`);
  }

  /** Atomically cancel an active order and place its replacement. Requires Trade scope. */
  replace(orderId: string, input: ReplaceOrderInput): Promise<Order> {
    return this.client.request<Order>(`orders/${encodeURIComponent(orderId)}`, {
      method: "PUT",
      body: input
    });
  }

  /** Cancel an open or partially filled order. Requires Trade scope. */
  cancel(orderId: string): Promise<null> {
    return this.client.request<null>(`orders/${encodeURIComponent(orderId)}`, {
      method: "DELETE"
    });
  }
}
