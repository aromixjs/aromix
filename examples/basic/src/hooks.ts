import { Hook, receive, send } from "@aromix/core";

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
