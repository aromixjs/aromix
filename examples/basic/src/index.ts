import { make } from "@aromix/core";
import { serve } from "@aromix/node";
import { view } from "./plugins/view";
import { router } from "./router";

const app = make({
  plugins: [view({ router })],
});

serve(app).listen(3000, () => {
  console.log("App is running on port 3000");
});
