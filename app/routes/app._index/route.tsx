import React from "react";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Button,
  ButtonGroup,
  Card,
  Grid,
  Page,
  Text
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../../shopify.server";
import Spacer from "app/components/Spacer";
import FormField from "app/components/Field/FormField";
import { json, useActionData, useFetcher, useLoaderData } from "@remix-run/react";
import IframePreview from "app/components/Iframe/Iframe";
import DragAndDropForm from "app/components/DragAndDropForm/DragAndDropForm";


interface FormField {
  id: string
  label: string;
  placeholder: string;
  type: string;
  width: string;
}



export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const customer = await prisma.session.findUnique({
    where: {
      id: session.id
    }
  })

  const form = customer?.form ? customer?.form : "[]";
  const formJson = JSON.parse(form);
  return new Response(JSON.stringify(formJson), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const data = await request.json();
  const dataReset = JSON.parse(data.reset);
  const dataJson = JSON.parse(data.formFields) as FormField[];

  if (dataReset && dataReset === true) {
    await prisma.session.update(
      {
        where: {
          id: session.id,
        },
        data: {
          form: "[]"
        },
      }
    )
  }
  

  if (!dataJson.length) {
    return new Response(JSON.stringify({ error: "The Form fields cannot be empty" }), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  }

  const form = await prisma.session.update(
    {
      where: {
        id: session.id,
      },
      data: {
        form: data.formFields
      },
    }
  )

  if (!form) {
    return new Response(JSON.stringify({ error: "The form is not updated" }), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  }

  return new Response(JSON.stringify(dataJson), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
};


const initialValues = {
  types: ["email", 'first_name', "last_name", 'tel', 'other_1', 'other_2', "other_3", "comment"],
  emptyField: {
    id: String(new Date().getTime()),
    label: "",
    placeholder: "",
    type: "",
    width: ""
  }
}

const IndexR: React.FC = () => {
  const fetcher = useFetcher();
  const actionData = fetcher.data;
  const loaderData = useLoaderData<typeof loader>();

  const initialTypes = (types: string[], loaderData: FormField[]): string[] => {
    const correctTypes = types.filter(type => {
      const includedType = loaderData.some(loaderItem => loaderItem.type === type);
      if (!includedType) {
        return type
      }
    })
    return correctTypes
  }


  const [typesField, setTypesField] = React.useState<string[]>(initialTypes(initialValues.types, loaderData));
  const [formFields, setFormFields] = React.useState<FormField[]>(loaderData);
  const [formField, setFormField] = React.useState<FormField>(initialValues.emptyField);
  const [edit, setEdit] = React.useState<boolean>(false);

  const handleFormFieldChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormField((prev) => ({ ...prev, id: String(new Date().getTime()), [name]: value }));
  }

  const handleSave = () => {
    setFormFields((prev) => [...prev, formField]);
    setTypesField(typesField.filter(el => el !== formField.type));
    setFormField(initialValues.emptyField);
  }

  const handleSaveForm = React.useCallback(() => {
    fetcher.submit(
      {
        formFields: JSON.stringify(formFields)
      },
      {
        method: "POST",
        encType: "application/json",
      }
    );
  }, [formFields])

  const handleResetForm = React.useCallback(() => {
    setFormFields([]);
    setTypesField(initialValues.types);
    setFormField(initialValues.emptyField);
    
    fetcher.submit(
      {
        reset: true,
        formFields: JSON.stringify([])
      },
      {
        method: "POST",
        encType: "application/json",
      }
    );
  }, [])

  const handleEditForm = React.useCallback(() => {
    setEdit(prev => !prev)
  }, [setEdit])

  const handlePosition = React.useCallback((fields: FormField[]) => {
    setFormFields(fields)
  }, [setFormFields])

  const handleChangeField = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, dataset: { id } } = event.target;

    setFormFields(prev => [...prev].map(prevElement => {
      if (prevElement.id === id && (name === "label" || name === "placeholder")) {
        prevElement[name] = value
        return prevElement
      }
      return prevElement
    }))
  }

  return (
    <Page fullWidth>
      <TitleBar title="Form Builder">
      </TitleBar>
      <Grid columns={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
        <Grid.Cell columnSpan={{ xs: 2, sm: 2, md: 2, lg: 2, xl: 2 }}>
          <Card>
            <Text as="h2" variant="bodyMd">
              {edit ? "Edit form" : "Preview Form"}
            </Text>
            <Spacer />
            {
              edit ?
                <DragAndDropForm formFields={formFields} handlePosition={handlePosition} handleChangeField={handleChangeField} />
                : <IframePreview fields={formFields} />

            }
            <Spacer />
            <ButtonGroup gap="loose">
              {edit ?
                <Button variant="secondary" onClick={handleEditForm}>Save</Button>
                :
                <>
                  <Button variant="primary" onClick={handleSaveForm}>Save</Button>
                  <Button variant="secondary" onClick={handleEditForm} >Edit</Button>
                  <Button variant="tertiary" onClick={handleResetForm}>Reset</Button>
                </>
              }
            </ButtonGroup>

          </Card>
        </Grid.Cell>
        <Grid.Cell columnSpan={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 1 }}>
          <Card>
            <Text as="h2" variant="bodyMd">
              Settings for field
            </Text>
            <Spacer />
            <FormField value={formField.label} type="text" id="form_field" name="label" onChange={handleFormFieldChange} heading="Label for field" />
            <Spacer />
            <FormField value={formField.placeholder} type="text" id="form_placeholder" name="placeholder" onChange={handleFormFieldChange} heading="Placeholder for field" />
            <Spacer />
            <FormField value={formField.type} options={typesField} type="selector" id="form_type" name="type" onChange={handleFormFieldChange} heading="Type for field" />
            <Spacer />
            <FormField value={formField.width} options={["Full", 'Half', "Third", 'Quarter']} type="selector" id="form_width" name="width" onChange={handleFormFieldChange} heading="Width of field" />
            <Spacer />
            <Button disabled={formField.label.length > 1 && formField.placeholder.length > 1 && formField.type && formField.width ? false : true} onClick={handleSave}>Create field</Button>
          </Card>
        </Grid.Cell>
      </Grid>
    </Page>
  )
}

export default IndexR