import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { TitleBar } from "@shopify/app-bridge-react";
import { Box, Card, Page, Text } from "@shopify/polaris";
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

  const shopifyCustomer = await admin.graphql(
    `#graphql
      query Customer($email: String!) {
        customers(first: 1, query: $email) {
          nodes {
            id
            firstName
            lastName
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

export default function Candidate() {
  const loaderData = useLoaderData<typeof loader>();
  const { isCustomer, customer, candidate } = loaderData;

  return (
    <Page>
      <TitleBar title="Candidate">
      </TitleBar>
      {isCustomer && customer ? (
        <>
          <Card>
            <Box>
              <Text as="h1" variant="headingMd">Customer Information</Text>
              <Text as="p"><strong>Name:</strong> {customer.firstName} {customer.lastName}</Text>
            </Box>
          </Card>
          <Spacer />
        </>
      ) : null}

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
    </Page>
  );
}