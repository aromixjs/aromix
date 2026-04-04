import { createRouter } from "./plugins/router";

export const router = createRouter();

router.on(
  "/",
  () => `
  <!DOCTYPE html>
  <html>
    <head><title>Home</title></head>
    <body>
      <h1>Welcome to Aromix!</h1>
    </body>
  </html>
`
);

router.on(
  "/about",
  () => `
  <!DOCTYPE html>
  <html>
    <head><title>About</title></head>
    <body>
      <h1>About Page</h1>
      <p>This is a simple view plugin.</p>
    </body>
  </html>
`
);
