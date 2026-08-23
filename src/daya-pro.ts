import { DEFAULT_BASE_URL } from "./constants";
import { HttpClient } from "./http-client";
import { Markets } from "./markets";
import type { DayaProConfig } from "./types";

export class DayaPro {
  readonly client: HttpClient;
  readonly markets: Markets;

  constructor(config: DayaProConfig = {}) {
    this.client = new HttpClient({ ...config, baseUrl: config.baseUrl ?? DEFAULT_BASE_URL });
    this.markets = new Markets(this.client);
  }
}
