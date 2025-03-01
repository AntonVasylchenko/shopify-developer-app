import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { TitleBar } from "@shopify/app-bridge-react";
import { Box, Button, Card, Grid, Page, Text } from "@shopify/polaris";
import Spacer from "app/components/Spacer";
import prisma from "app/db.server";
import { authenticate } from "app/shopify.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const candidateId = params.candidateId;

  const candidate = await prisma.candidate.findUnique({
    where: {
      id: candidateId
    }
  })

  const email = candidate?.email || ""

  let shopifyCustomer = await admin.graphql(
    `#graphql
      query Customer($email: String!) {
        customers(first: 1, query: $email) {
          nodes {
            id
            firstName
            lastName
            tags
          }
        }
      }
    `,
    {
      variables: {
        email: `email:${email}`
      }
    }
  );

  const customer = await shopifyCustomer.json();
  const isCustomer = !!customer.data.customers.nodes[0];

  const result = {
    isCustomer,
    customer: customer.data.customers.nodes[0],
    candidate: candidate
  }
  return new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const data = await request.json();
  const candidateId = params.candidateId;

  const updatedCandidate = await prisma.candidate.update({
    where: {
      id: candidateId
    },
    data: {
      approved: data.approved
    }
  })

  let shopifyCustomer = await admin.graphql(
    `#graphql
      query Customer($email: String!) {
        customers(first: 1, query: $email) {
          nodes {
            id
            firstName
            lastName
            tags
          }
        }
      }
    `,
    {
      variables: {
        email: `email:${updatedCandidate.email}`
      }
    }
  );

  const customer = await shopifyCustomer.json();

  const isApproved = data.approved
  const isCustomer = !!customer.data.customers.nodes[0];

  if (isCustomer === true) {
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
            "tags": [isApproved ? "b2b" : "b2c"],
            "id": customer.data.customers.nodes[0].id
          }
        }
      }
    )
  }


  const flow = await admin.graphql(
    `#graphql
      mutation FlowTriggerReceive($handle: String!, $payload: JSON!) {
        flowTriggerReceive(handle: $handle, payload: $payload) {
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      variables: {
        handle: "customer-appoved",
        payload: {
          Customer: isCustomer,
          Email: updatedCandidate.email,
          Appoved: isApproved
        }
      }
    }
  );


  return new Response();
};

export default function Candidate() {
  const submit = useSubmit();
  const loaderData = useLoaderData<typeof loader>();
  const { isCustomer, customer, candidate } = loaderData;


  const handleStatus = () => {
    submit(
      { "approved": !candidate.approved },
      { method: "post", encType: "application/json" }
    );
  }

  return (
    <Page fullWidth>
      <TitleBar title="Candidate">
      </TitleBar>
      <Grid>
        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
          {candidate && (
            <Card>
              <Box>
                <Text as="h1" variant="headingMd">Candidate Information</Text>
                <Text as="p"><strong>ID:</strong> {candidate.id}</Text>
                <Text as="p"><strong>Name:</strong> {candidate.first_name} {candidate.last_name}</Text>
                <Text as="p"><strong>Email:</strong> {candidate.email}</Text>
                <Text as="p"><strong>Phone:</strong> {candidate.tel}</Text>
                <Text as="p"><strong>Other Info:</strong> {candidate.other_1}, {candidate.other_2}, {candidate.other_3}</Text>
                <Text as="p"><strong>Comment:</strong> {candidate.comment}</Text>
                <Text as="p"><strong>Approved:</strong> {candidate.approved ? "Yes" : "No"}</Text>
              </Box>
            </Card>
          )}
        </Grid.Cell>
        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
          <Card>
            <Box>
              <Text as="h1" variant="headingMd">Customer Information</Text>
              {isCustomer && customer ? (
                <>
                  <Text as="p"><strong>Name:</strong> {customer.firstName} {customer.lastName}</Text>
                </>
              ) : <Text as="p">The candidate is not the customer.</Text>}
            </Box>
          </Card>

        </Grid.Cell>
      </Grid>
      <Spacer />
      <Card>
        <Button variant="primary" onClick={handleStatus} >{candidate.approved ? "Cancel candidate" : "Confirm candidate"}</Button>
      </Card>
    </Page>
  );
}