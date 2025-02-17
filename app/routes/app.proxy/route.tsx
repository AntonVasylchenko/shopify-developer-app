import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { authenticate } from "app/shopify.server";
import prisma from "app/db.server";
import { log } from "node:console";


interface Session {
  session_id: string;
  id: string;
  shop: string;
  state: string;
  isOnline: boolean;
  scope?: string;
  expires?: Date;
  accessToken: string;
  userId?: bigint;
  firstName?: string;
  lastName?: string;
  email?: string;
  accountOwner: boolean;
  locale?: string;
  collaborator?: boolean;
  emailVerified?: boolean;
  Candidates: Candidate[];
  form?: string;
}

interface Candidate {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email?: string;
  first_name?: string;
  last_name?: string;
  tel?: string;
  other_1?: string;
  other_2?: string;
  other_3?: string;
  comment?: string;
  Session?: Session;
  sessionSession_id?: string;
}

interface Field {
  id: string,
  label: string,
  placeholder: string,
  type: string,
  width: string
}


function getFormConfig(formConfig: string): Field[] {
  try {
    return JSON.parse(formConfig)
  } catch (error) {
    return []
  }
}

function createField(formFields: Field[]): string {
  return formFields
    .map(element => {
      if (element.type === "comment") {
        return /* html */ `
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
        return /* html */ `
          <div class="form-field form-field--${element.width}">
            <label for="${element.id}">${element.label}</label>
            <input
              required
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

    .form-success {
      max-width: 600px;
      margin: 20px auto;
      color: #155724;
      background: #d4edda;
      border: 1px solid #c3e6cb;
      padding: 10px;
      margin-top: 5px;
      border-radius: 5px;
      font-size: 14px;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .form-success::before {
      content: "✅";
      font-size: 16px;
    }

    .form-error {
      max-width: 600px;
      margin: 20px auto;
      color: #d9534f;
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      padding: 10px;
      margin-top: 5px;
      border-radius: 5px;
      font-size: 14px;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .form-error::before {
      content: "⚠️";
      font-size: 16px;
    }

    @media (max-width: 600px) {
      .form-field {
        flex: 1 1 100%;
      }
    }
  `;
}

function createError(error: string | null): string {
  switch (error) {
    case "1":
      return "<div class='form-error'>Candidate already exists.</div>"
    case "app":
      return "<div class='form-error'>Session not found or invalid.</div>"
    default:
      return ""
  }
}

function createSuccess(flag: boolean): string {
  return flag ? "<div class='form-success'> The form has been successfully submitted! Further instructions will be sent to your email after validation.</div>" : ""
}


export const loader = async ({ request }: LoaderFunctionArgs) => {
  const headers = new Headers();
  headers.append("ngrok-skip-browser-warning", "true");
  const url = new URL(request.url);
  const errorForm = url.searchParams.get("error");
  const successForm = url.searchParams.get("success") ? true : false;
  
  const { liquid, session } = await authenticate.public.appProxy(request);

  const form = await prisma.session.findUnique({
    where: {
      id: session?.id,
    },
  }) as Session

  const formString = form.form || "[]";
  const formObject = getFormConfig(formString);

  return liquid(`
    <section class="app-form">
      <div class="page-width">
        <style>
            ${createStyle()}
        </style>
        ${createError(errorForm)}
        ${createSuccess(successForm)}
        <form method="post" action="/apps/form">
          ${createField(formObject)}
          <button type="submit">Submit</button>
        </form>
      </div>
    </section>
  `)
};

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const { admin, session } = await authenticate.public.appProxy(request);
    const formData = await request.formData();
    const updates = Object.fromEntries(formData);

    const merchant = await prisma.session.findUnique({
      where: {
        id: session?.id
      }
    }) as Session

    if (!merchant) {
      return redirect("/apps/form?error=app")
    }

    const isExistCandidate = await prisma.candidate.findFirst({
      where: {
        email: updates.email as string
      }
    })

    if (isExistCandidate) {
      return redirect("/apps/form?error=1")
    }

    const candidate = await prisma.candidate.create({
      data: {
        ...updates,
        sessionSession_id: merchant.session_id
      }
    }) as Candidate

    if (!candidate) {
      return redirect("/apps/form?error=app")
    }
    return redirect("/apps/form?success=1");
  } catch (error) {
    console.log(error);
    return redirect("/apps/form?error=app")

  }
}



