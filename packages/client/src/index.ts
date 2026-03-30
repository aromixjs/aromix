import { decode, encode } from "@msgpack/msgpack";

export interface ClientOptions {
  baseURL: string;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ClientResponse<T = any> {
  data: T;
  errors?: Array<{ message: string }>;
}

export class AromixClient {
  private baseURL: string;
  private headers: Record<string, string>;
  private timeout: number;

  constructor(options: ClientOptions) {
    this.baseURL = options.baseURL.replace(/\/$/, "");
    this.headers = {
      "Content-Type": "application/msgpack",
      "X-Action": "default",
      ...options.headers,
    };
    this.timeout = options.timeout ?? 30000;
  }

  async call<T = any>(action: string, payload?: any): Promise<ClientResponse<T>> {
    const url = `${this.baseURL}`;
    
    const encoded = encode({
      action,
      payload,
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          ...this.headers,
          "X-Action": action,
        },
        body: encoded,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const decoded = decode<any>(new Uint8Array(arrayBuffer));

      return decoded as ClientResponse<T>;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Request timed out after ${this.timeout}ms`);
      }
      throw error;
    }
  }

  async get<T = any>(action: string): Promise<ClientResponse<T>> {
    return this.call<T>(action);
  }

  async post<T = any>(action: string, payload: any): Promise<ClientResponse<T>> {
    return this.call<T>(action, payload);
  }
}

export function createClient(options: ClientOptions): AromixClient {
  return new AromixClient(options);
}
