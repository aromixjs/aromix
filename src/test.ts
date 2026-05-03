import { program } from "./lib/program";
import { inject, provide } from "./lib/service";


@provide()
class UserService {


   doS() { }
}


class EmailService { }



class QueueService { }


const user = program({
   name: 'user',
   services: {
      user: UserService,
      emailService: EmailService,
      QueueService
   }
})



user.command('getAll', [], () => {



})



user.stream('stream', () => {



})



console.log(user.meta);



