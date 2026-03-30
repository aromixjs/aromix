import { PacketSchema } from "@aromix/core";
import * as v from "valibot";

export const userGetInput = {
  payload: v.object({
    id: v.string(),
  }),
} satisfies PacketSchema;
