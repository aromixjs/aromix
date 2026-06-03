import { ax } from "@aromix/validator";

const validator = ax.operator((value: string) => {


   return value


})



const schema = ax.string().pipe([
   validator
])