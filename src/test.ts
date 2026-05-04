import { make } from "./lib/make";
import { program } from "./lib/program";

const users = program({
   name: 'users'
})



users.command('getAll', (ctx) => {



})






const app = make({
   programs: [users]
})

console.log(app);
console.log(app.meta);

