import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { authenticate } from "app/shopify.server";


function getFormConfig(formConfig: string) {
  try {
    return JSON.parse(formConfig)
  } catch (error) {
    return []
  }
}

function createField(formFields:any) {
  return formFields
    .map(element => {
      if (element.type === "comment") {
        return `
          <div class="form-field form-field--${element.width}">
            <label for="${element.id}">${element.label}</label>
            <textarea 
              name="${element.type}" 
              id="${element.id}" 
              placeholder="${element.placeholder}"
            ></textarea>
          </div>
        `;
      } else {
        return `
          <div class="form-field form-field--${element.width}">
            <label for="${element.id}">${element.label}</label>
            <input
              type="text" 
              name="${element.type}" 
              id="${element.id}" 
              placeholder="${element.placeholder}" 
            />
          </div>
        `;
      }
    })
    .join("");
}


function createStyle(): string {
  return /*css*/`
    .app-form {
      margin: 20px 0;
    }
    form {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
    }

    .form-field {
      display: flex;
      flex-direction: column;
    }

    .form-field label {
      font-weight: bold;
      margin-bottom: 5px;
    }

    .form-field input,
    .form-field textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 5px;
      font-size: 16px;
    }

    .form-field textarea {
      min-height: 100px;
      resize: vertical;
    }

    .form-field--Full {
      flex: 1 1 100%;
    }

    .form-field--Half {
      flex: 1 1 calc(50% - 15px);
    }

    .form-field--Third {
      flex: 1 1 calc(33.333% - 15px);
    }

    .form-field--Quarter {
      flex: 1 1 calc(25% - 15px);
    }

    button[type="submit"] {
      background-color: #007bff;
      color: white;
      font-size: 16px;
      font-weight: bold;
      padding: 12px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background 0.3s ease-in-out;
      flex: 1 1 100%;
      text-align: center;
    }

    button[type="submit"]:hover {
      background-color: #0056b3;
    }

    button[type="submit"]:active {
      background-color: #004494;
    }

    button[type="submit"]:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    @media (max-width: 600px) {
      .form-field {
        flex: 1 1 100%;
      }
    }
  `;
}




export const loader = async ({ request }: LoaderFunctionArgs) => {
  const headers = new Headers();
  headers.append("ngrok-skip-browser-warning", "true");
  const { liquid, session } = await authenticate.public.appProxy(request);

  const form = await prisma.session.findUnique({
    where: {
      id: session?.id,
    },
  })

  const formString = form?.form ? form.form : "[]" as string
  const formObject = getFormConfig(formString);

  return liquid(`
    <section class="app-form">
      <div class="page-width">
        <style>
            ${createStyle()}
        </style>
        <form method="post" action="/apps/form">
          ${createField(formObject)}
          <button type="submit">Submit</button>
        </form>
      </div>
    </section>
  `)
};

export const action = async ({ request }: ActionFunctionArgs) => {  
  const { admin, session } = await authenticate.public.appProxy(request);
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);
  console.log(updates);
  
  return redirect("/apps/form")
}



