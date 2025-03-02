import { ActionFunctionArgs } from "@remix-run/node";


export const action = async ({ request }: ActionFunctionArgs) => {
  const payload = await request.json();
  const validJson = payload
    .replace(/'/g, '"')
    .replace(/(\w+):/g, '"$1":');

  console.log(payload, validJson);
  const data = JSON.parse(validJson);
  const { email, approved, customer } = data;
  console.log("email", typeof email);
  console.log("approved", typeof approved);
  console.log("customer", typeof customer);
  return null
}



