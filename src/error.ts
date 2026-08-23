import type { DayaApiErrorBody } from "./types";

export class DayaProError extends Error {
  readonly status: number;
  readonly code: string | undefined;
  readonly response: DayaApiErrorBody | undefined;

  constructor(message: string, status: number, response?: DayaApiErrorBody) {
    super(message);
    this.name = "DayaProError";
    this.status = status;
    this.code = response?.error?.code;
    this.response = response;
  }
}
