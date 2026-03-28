import { make } from "@aromix/core";
import { serve } from "@aromix/node";
import { UserGroup } from "./user/user.group";
import { authHook, loggerHook, ResponseLogger } from "./hooks";

const app = make({
  groups: [UserGroup],
  hooks: [loggerHook, authHook, ResponseLogger()],
});

serve(app).listen(3000, () => {
  console.log("App is running on port 3000");
});
