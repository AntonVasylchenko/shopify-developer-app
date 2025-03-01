import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "app/db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { payload, admin } = await authenticate.webhook(request);
  const { email } = payload;
  const candidate = await prisma.candidate.findFirst({
    where: {
      email: email
    }
  })

  console.log("candidate", candidate);
  console.log("admin", admin ? true : false);
  console.log("admin_graphql_api_id", payload.admin_graphql_api_id);


  if (candidate && admin && payload.admin_graphql_api_id) {
    await admin.graphql(
      `#graphql
        mutation updateCustomerTag($input: CustomerInput!) {
          customerUpdate(input: $input) {
            customer {
              id
              tags
            }
            userErrors {
              message
              field
            }
          }
        }
      `,
      {
        variables: {
          input: {
            "tags": [candidate?.approved ? "b2b" : "b2c"],
            "id": payload.admin_graphql_api_id
          }
        }
      }
    )
  }
  return new Response();
};
