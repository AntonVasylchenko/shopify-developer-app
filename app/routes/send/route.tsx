import { ActionFunctionArgs } from "@remix-run/node";


export const action = async ({ request }: ActionFunctionArgs) => {
  const payload =  await request.json();
  console.log(payload);
  
  const { email, approved, customer } = payload;
  console.log("email",typeof email);
  console.log("approved",typeof approved);
  console.log("customer",typeof customer);
  return null
}



