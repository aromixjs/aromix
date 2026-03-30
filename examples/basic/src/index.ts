import { make } from "@aromix/core";
import { serve } from "@aromix/node";
import { UserGroup } from "./user/user.group";
import { authHook, ErrorHook, loggerHook } from "./hooks";

const app = make({
  groups: [UserGroup],
  hooks: [loggerHook, authHook, ErrorHook],
});

serve(app).listen(3000, () => {
  console.log("App is running on port 3000");
});
