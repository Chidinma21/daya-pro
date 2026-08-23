import { HttpClient } from "./http-client";

export interface DepositChainAddress {
  blockchain: string;
  blockchain_name: string;
  icon: string;
  contract_address: string;
  decimals: number;
  deposit_address: string;
  qr_code_url: string;
  fee_amount: string;
  fee_asset: string;
}

export interface DepositAsset {
  asset: string;
  display_name: string;
  icon: string;
  decimals: number;
  chains: DepositChainAddress[];
}

export interface DepositAddresses {
  assets: DepositAsset[];
}

export interface CompletedDeposit {
  id: string;
  type: "deposit";
  method: "bank_transfer";
  status: "completed";
  amount_ngn: string;
  fee_amount_ngn: string;
  currency: "NGN";
  payment_provider: string;
  provider_transaction_id: string;
  tx_ref: string;
  originator_name: string;
  matching_reference: string;
  reference: string;
  narration: string;
  description: string;
  created_at: string;
  completed_at: string;
}

export interface DepositPagination {
  total: number;
  limit: number;
  offset: number;
  has_next: boolean;
}

export interface CompletedDeposits {
  deposits: CompletedDeposit[];
  pagination: DepositPagination;
}

export interface ListCompletedDepositsOptions {
  /** Defaults to 20; maximum is 100. */
  limit?: number;
  /** Defaults to 0; maximum is 1,000,000. */
  offset?: number;
  /** Start date (YYYY-MM-DD) or RFC3339 timestamp. */
  from?: string;
  /** End date (YYYY-MM-DD) or RFC3339 timestamp. */
  to?: string;
}

export class Deposits {
  constructor(private readonly client: HttpClient) {}

  /** List provisioned crypto deposit addresses grouped by asset. */
  listAddresses(): Promise<DepositAddresses> {
    return this.client.request<DepositAddresses>("deposits/addresses");
  }

  /** List completed NGN bank-transfer deposits for reconciliation. */
  listCompleted(
    options: ListCompletedDepositsOptions = {},
  ): Promise<CompletedDeposits> {
    return this.client.request<CompletedDeposits>("deposits/completed", {
      query: {
        limit: options.limit,
        offset: options.offset,
        from: options.from,
        to: options.to,
      },
    });
  }
}
