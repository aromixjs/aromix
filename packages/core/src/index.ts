import { action } from "./lib/action";
import { inject, injectNew, provide } from "./lib/di";
import { group } from "./lib/group";
import {
  type InputSchema,
  input,
  contextStorage,
  type RequestContext,
  type ResponsePayload,
} from "./lib/input";
import { type AromixDescriptor, make } from "./lib/make";
import { type Result, result } from "./lib/result";

export {
  action,
  group,
  inject,
  injectNew,
  input,
  contextStorage,
  make,
  provide,
  result,
  type RequestContext,
  type ResponsePayload,
  type AromixDescriptor,
  type InputSchema,
  type Result,
};
