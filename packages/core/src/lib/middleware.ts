import { contextStorage, RawContext, ReplyValue } from "./context";

export type Next = () => Promise<ReplyValue>;

export type MiddlewareFn = (next: Next) => Promise<ReplyValue>;

export interface Middleware {
  readonly name: string;
  readonly run: MiddlewareFn;
}

export async function runChain(
  chain: readonly Middleware[],
  ctx: RawContext,
  handler: () => Promise<ReplyValue>,
): Promise<ReplyValue> {
  let index = 0;

  const next = (): Promise<ReplyValue> => {
    if (index < chain.length) {
      const mw = chain[index++];
      return mw.run(next);
    }
    return handler();
  };

  return contextStorage.run(ctx, next);
}
