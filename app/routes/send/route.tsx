import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "app/shopify.server";


export const loader = async ({ request }: LoaderFunctionArgs) => {
  const headers = new Headers();
  headers.append("ngrok-skip-browser-warning", "true");
  return null
};

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("send email", request.body);
  console.log("send email", await request.json());
  return null
}



