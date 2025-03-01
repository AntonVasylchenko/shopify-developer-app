import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { payload, shop, session, topic } = await authenticate.webhook(request);
  console.log(payload);
  

  console.log(`Received ${topic} webhook for ${shop}`);

  return new Response();
};
