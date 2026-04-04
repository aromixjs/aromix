//@ts-nocheck

import { make } from "@aromix/core";
import { serve } from "@aromix/node";

const app = make({
plugins:[view()]

});

serve(app).listen(3000, () => {
  console.log("App is running on port 3000");
});
