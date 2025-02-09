import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { authenticate } from "app/shopify.server";


export const loader = async ({ request }: LoaderFunctionArgs) => {
  const headers = new Headers();
  headers.append("ngrok-skip-browser-warning", "true");
  const { liquid,session } = await authenticate.public.appProxy(request);

  console.log(1);
  

  // const form = await prisma.session.findUnique({
  //   where: {
  //     id: session?.id,
  //   },
  // })

  // console.log(form,1);
  

  return liquid("<div>Hello 2</div>")
};

export const action = async ({ request }: ActionFunctionArgs) => {
  return null
}



