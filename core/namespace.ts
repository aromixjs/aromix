import type { Maybe, Union } from "./types";

// Symbol to avoid collisions with user-defined properties on the constructor
const NameSpaceMetaKey = Symbol("oriel-namespace-meta");

export type NamespaceMeta = {
  prefix: string;
  middlewares: any[];
};

/**
 * Groups a handler class under a route prefix.
 *
 * @example
 * @namespace("users")
 * class UserHandler { ... }
 */
export interface NamespaceDecorator {
  (prefix: string, middlewares?: any[]): ClassDecorator;
  getMeta(target: Union<[object, Function]>): Maybe<NamespaceMeta>;
}

export const namespace: NamespaceDecorator = (prefix, middlewares = []) => {
  return (target: any) => {
    target[NameSpaceMetaKey] = { prefix, middlewares };
  };
};

// normalizes instance → constructor so getMeta works on both
namespace.getMeta = (target: Union<[object, Function]>) => {
  const ctor: any = typeof target === "function" ? target : target.constructor;
  return ctor[NameSpaceMetaKey];
};