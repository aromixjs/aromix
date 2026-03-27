import { ResponseBuilder } from "./response";

export type Hook =
  | {
      event: "app:start";
      run: () => Promise<void> | void;
    }
  | {
      event: "app:stop";
      run: () => Promise<void> | void;
    }
  | {
      event: "before:handler";
      run: () => Promise<ResponseBuilder | void> | ResponseBuilder | void;
    }
  | {
      event: "after:handler";
      run: (builder: ResponseBuilder) => Promise<void> | void;
    }
  | {
      event: "error";
      run: (error: unknown) => Promise<ResponseBuilder> | ResponseBuilder;
    };
