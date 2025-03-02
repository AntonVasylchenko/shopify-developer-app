import { ActionFunctionArgs } from "@remix-run/node";
import { sendMail } from "app/email.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const response = await request.json();
  const validJson = response
    .replace(/'/g, '"')
    .replace(/(\w+):/g, '"$1":');

  const data = JSON.parse(validJson);
  const { email, approved, customer } = data;
  const payload = {
    email,
    approved: approved === "true" ? true : false,
    customer: customer === "true" ? true : false,
  }
  await sendMail(payload);
  return null
}



