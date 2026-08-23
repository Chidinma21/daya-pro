import { DEFAULT_BASE_URL } from "./constants";
import { HttpClient } from "./http-client";
import type { DayaProConfig } from "./types";

export class DayaPro {
  readonly client: HttpClient;

  constructor(config: DayaProConfig = {}) {
    this.client = new HttpClient({ ...config, baseUrl: config.baseUrl ?? DEFAULT_BASE_URL });
  }
}
