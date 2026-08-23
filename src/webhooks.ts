import { HttpClient } from "./http-client";

export type WebhookEvent =
  | "order.created"
  | "order.filled"
  | "order.partially_filled"
  | "order.cancelled"
  | "order.rejected"
  | "trade.executed"
  | "deposit.completed"
  | "crypto.deposit.completed";

export type WebhookStatus = "active" | "paused" | "disabled";
export type WebhookDeliveryStatus =
  | "pending"
  | "delivered"
  | "failed"
  | "retrying";

export interface Webhook {
  id: string;
  url: string;
  description: string;
  events: WebhookEvent[];
  status: WebhookStatus;
  failure_count: number;
  last_success_at: string | null;
  last_failure_at: string | null;
  last_failure_reason: string | null;
  created_at: string;
  updated_at: string;
}

/** Returned only when a webhook is created or its secret is rotated. */
export interface WebhookWithSecret extends Webhook {
  secret: string;
}

export interface CreateWebhookInput {
  url: string;
  events: WebhookEvent[];
  description?: string;
}

export interface UpdateWebhookInput {
  url?: string;
  events?: WebhookEvent[];
  description?: string;
  status?: WebhookStatus;
}

export interface ListWebhookDeliveriesOptions {
  /** Defaults to 50; accepted range is 1–100. */
  limit?: number;
  /** Number of delivery logs to skip. Defaults to 0. */
  offset?: number;
}

export interface WebhookDelivery {
  id: string;
  event_id: string;
  event_type: WebhookEvent;
  status: WebhookDeliveryStatus;
  attempts: number;
  max_attempts: number;
  response_status_code: number | null;
  last_error: string | null;
  last_attempt_at: string | null;
  next_retry_at: string | null;
  delivered_at: string | null;
  created_at: string;
}

export class Webhooks {
  constructor(private readonly client: HttpClient) {}

  /** List all configured webhooks. Requires Write scope. */
  list(): Promise<Webhook[]> {
    return this.client.request<Webhook[]>("webhooks");
  }

  /** Create a webhook. Store the returned secret securely; it is shown once. */
  create(input: CreateWebhookInput): Promise<WebhookWithSecret> {
    return this.client.request<WebhookWithSecret>("webhooks", {
      method: "POST",
      body: input,
    });
  }

  /** Retrieve one webhook by ID. Requires Write scope. */
  get(webhookId: string): Promise<Webhook> {
    return this.client.request<Webhook>(
      `webhooks/${encodeURIComponent(webhookId)}`,
    );
  }

  /** Update a webhook's configuration. Requires Write scope. */
  update(webhookId: string, input: UpdateWebhookInput): Promise<Webhook> {
    return this.client.request<Webhook>(
      `webhooks/${encodeURIComponent(webhookId)}`,
      { method: "PATCH", body: input },
    );
  }

  /** Delete a webhook and its delivery logs. Requires Write scope. */
  delete(webhookId: string): Promise<null> {
    return this.client.request<null>(
      `webhooks/${encodeURIComponent(webhookId)}`,
      { method: "DELETE" },
    );
  }

  /** Rotate the signing secret. The previous secret becomes invalid immediately. */
  rotateSecret(webhookId: string): Promise<WebhookWithSecret> {
    return this.client.request<WebhookWithSecret>(
      `webhooks/${encodeURIComponent(webhookId)}/rotate-secret`,
      { method: "POST" },
    );
  }

  /** List delivery attempts for a webhook. Requires Write scope. */
  listDeliveries(
    webhookId: string,
    options: ListWebhookDeliveriesOptions = {},
  ): Promise<WebhookDelivery[]> {
    return this.client.request<WebhookDelivery[]>(
      `webhooks/${encodeURIComponent(webhookId)}/deliveries`,
      { query: { limit: options.limit, offset: options.offset } },
    );
  }
}
