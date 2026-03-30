import { Send } from "./send";

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
      run: () => Promise<Send | void> | Send | void;
    }
  | {
      event: "after:handler";
      run: (result: Send) => Promise<Send> | Send;
    }
  | {
      event: "error";
      run: (error: unknown) => Promise<Send> | Send;
    };