export interface DayaProConfig {
  apiKey?: string;
  baseUrl?: string;
  fetch?: typeof fetch;
}

export interface DayaApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface DayaApiErrorBody {
  success: false;
  message: string;
  error?: {
    code?: string;
    message?: string;
    [key: string]: unknown;
  };
  timestamp?: string;
}
