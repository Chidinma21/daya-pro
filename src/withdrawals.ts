import { HttpClient } from "./http-client";

export type WithdrawalStatus = "pending" | "processing" | "completed" | "failed";

export interface OnchainWithdrawalChain {
  blockchain: string;
  blockchain_name: string;
  icon: string;
  contract_address?: string;
  decimals: number;
  fee_amount: string;
  fee_asset: string;
}

export interface OnchainWithdrawalAsset {
  asset: string;
  display_name: string;
  icon: string;
  decimals: number;
  chains: OnchainWithdrawalChain[];
}

export interface OnchainWithdrawalOptions {
  assets: OnchainWithdrawalAsset[];
}

export interface WithdrawOnchainInput {
  idempotency_key: string;
  asset: string;
  amount: string;
  blockchain: string;
  to_address: string;
}

export interface OnchainWithdrawal {
  transaction_id: string;
  status: WithdrawalStatus;
  amount: string;
  asset: string;
  fee: string;
  transaction_hash?: string;
  blockchain: string;
  created_at: string;
}

interface BaseBankWithdrawalInput {
  idempotency_key: string;
  amount: string;
  currency: "NGN";
  narration?: string;
}

export interface SavedBankWithdrawalInput extends BaseBankWithdrawalInput {
  bank_account_id: string;
  account_number?: never;
  bank_code?: never;
  account_name?: never;
  bank_name?: never;
}

export interface InlineBankWithdrawalInput extends BaseBankWithdrawalInput {
  bank_account_id?: never;
  account_number: string;
  bank_code: string;
  account_name: string;
  bank_name: string;
}

export type WithdrawToBankInput =
  | SavedBankWithdrawalInput
  | InlineBankWithdrawalInput;

export interface BankWithdrawal {
  transaction_id: string;
  status: WithdrawalStatus;
  amount: string;
  currency: string;
  fee: string;
  transfer_id?: string;
  created_at: string;
}

export class Withdrawals {
  constructor(private readonly client: HttpClient) {}

  /** List enabled on-chain withdrawal rails and current fees. Requires Read scope. */
  listOnchainOptions(): Promise<OnchainWithdrawalOptions> {
    return this.client.request<OnchainWithdrawalOptions>(
      "withdrawals/onchain/options",
    );
  }

  /** Initiate an asynchronous on-chain withdrawal. Requires Trade scope. */
  withdrawOnchain(input: WithdrawOnchainInput): Promise<OnchainWithdrawal> {
    return this.client.request<OnchainWithdrawal>("withdrawals/onchain", {
      method: "POST",
      body: input,
    });
  }

  /** Initiate an asynchronous NGN bank withdrawal. Requires Trade scope. */
  withdrawToBank(input: WithdrawToBankInput): Promise<BankWithdrawal> {
    return this.client.request<BankWithdrawal>("withdrawals/bank", {
      method: "POST",
      body: input,
    });
  }
}
