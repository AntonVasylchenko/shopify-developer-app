import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "app/shopify.server";


export const loader = async ({ request }: LoaderFunctionArgs) => {
  const headers = new Headers();
  headers.append("ngrok-skip-browser-warning", "true");
  console.log("get email",request.body);

  return null
};

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("send email",request.body);
  try {
    const { admin, session } = await authenticate.public.appProxy(request);
    return null
  } catch (error) {
    console.log(error);
    return null
  }
}



