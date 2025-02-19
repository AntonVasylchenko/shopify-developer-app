import { TitleBar } from "@shopify/app-bridge-react";
import { Card, IndexTable, Layout, Link, Page, Text, useIndexResourceState } from "@shopify/polaris";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "app/shopify.server";
import prisma from "app/db.server";
import { Outlet, useLoaderData } from "@remix-run/react";

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
  approved: boolean
  [key: string]: unknown
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const customer = await prisma.session.findUnique({
    where: {
      id: session.id
    }
  });

  const sessionId = customer?.session_id

  const candidates = await prisma.candidate.findMany({
    where: {
      sessionSession_id: sessionId
    }
  })

  return new Response(JSON.stringify(candidates), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
};
export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  return new Response();
};


export default function Candidates() {
  const candidatesData = useLoaderData<typeof loader>() as Candidate[];
  const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(candidatesData);
  const resourceName = {
    singular: 'candidate',
    plural: 'candidates',
  };
  console.log(candidatesData);

  const rowMarkup = candidatesData.map((candidate, index) => {
    const { email, last_name, first_name, tel, other_1, other_2, other_3, comment, id, approved } = candidate;
    return (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >

        <IndexTable.Cell>
          <Link
            dataPrimaryLink
            url={`/app/candidates/${id}`}
          >
            <Text fontWeight="bold" as="span">
              {email}
            </Text>
          </Link>

        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text fontWeight="bold" as="span">
            {first_name}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text fontWeight="bold" as="span">
            {last_name}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text fontWeight="bold" as="span">
            {tel}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text fontWeight="bold" as="span">
            {approved ? "Confirmed" : "Not confirmed"}
          </Text>
        </IndexTable.Cell>
      </IndexTable.Row>
    )
  })


  return (
    <Page fullWidth>
      <TitleBar title="Candidates" />
      <Layout>
        <Layout.Section>
          <Card roundedAbove="lg" padding="050">
            <IndexTable
              resourceName={resourceName}
              itemCount={candidatesData.length}
              selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
              onSelectionChange={handleSelectionChange}
              headings={[
                { title: 'Email' },
                { title: 'First name' },
                { title: 'Last name' },
                { title: 'Phone' },
                { title: 'Status' }
              ]}
              selectable={false}
              pagination={{
                hasNext: false,
                hasPrevious: false,
                onNext: () => { console.log("next") },
                onPrevious: () => { console.log("prev") },
              }}
            >
              {rowMarkup}
            </IndexTable>
          </Card>
        </Layout.Section>
      </Layout>
      <Outlet/>
    </Page>
  );
}