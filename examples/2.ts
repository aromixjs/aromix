import * as v from "valibot";

const LoginSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
});

console.log(LoginSchema);

await new Promise((r) => setTimeout(r, 99999));
