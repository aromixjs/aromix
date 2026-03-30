import { Hook, receive, send } from "@aromix/core";
import { message } from "valibot";

export const loggerHook: Hook = {
  event: "before:handler",
  run: () => {
    const raw = receive();
    console.log(`→ ${raw.action} from ${raw.ip}`);
  },
};

export const authHook: Hook = {
  event: "before:handler",
  run: () => {
    const raw = receive();
    if (!raw.headers["authorization"]) {
      return send({
        errors: [
          {
            message: "Missing token",
          },
        ],
      });
    }
  },
};

export const ErrorHook: Hook = {
  event: "error",
  run(error) {
    if (error instanceof Error) {
      return send({
        errors: [
          {
            ...error,
          },
        ],
      });
    }

    return send({
      errors: [
        {
          message: "unknown Error",
        },
      ],
    });
  },
};
