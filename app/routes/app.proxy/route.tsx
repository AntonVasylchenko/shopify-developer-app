import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { authenticate } from "app/shopify.server";


function getFormConfig(formConfig: string) {
  try {
    return JSON.parse(formConfig)
  } catch (error) {
    return []
  }
}




function createHTMLForm(formConfig: any) {
  return `
  <form method="POST" action="/apps/form">
    ${formConfig.map((field: any) => {
      return `
      <div>
        <label>${field.label}</label>
        <input name="${field.label}" type="${field.type}" placeholder="${field.placeholder}" />
      </div>
      `
    }).join('')}
    <button type="submit">Submit</button>
  </form>
  `
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const headers = new Headers();
  headers.append("ngrok-skip-browser-warning", "true");
  const { liquid,session } = await authenticate.public.appProxy(request);

  const form = await prisma.session.findUnique({
    where: {
      id: session?.id,
    },
  })
 
  const formConfig = getFormConfig(form?.formConfig as string)

  

  return liquid(createHTMLForm(formConfig))
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin,session } = await authenticate.public.appProxy(request);
   
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);

  const candidate = await prisma.candidate.create({
    data: {
      email: "test@gmail.com",
      firstName: "Test",
      lastName: "Test",
      phone: "1234567890",
      Session: {
        connect: {
          session_id: "679f1ba9501af9998d933d09"
        }
      }
    }
  })
  console.log(candidate);
  console.log("Form data", updates);
  return redirect("/apps/form")
}



