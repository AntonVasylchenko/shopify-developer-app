import React from "react";
import { TitleBar } from "@shopify/app-bridge-react";
import { Card, IndexFilters, IndexTable, Layout, Link, Page, Text, useIndexResourceState } from "@shopify/polaris";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "app/shopify.server";
import prisma from "app/db.server";
import { Outlet, useLoaderData, useSubmit } from "@remix-run/react";
import { createPagination } from "app/utility";

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
  const url = new URL(request.url);
  const skipItem = url.searchParams.get("page") || 1;
  const takeItem = url.searchParams.get("take") || 10;


  const { session } = await authenticate.admin(request);

  const customer = await prisma.session.findUnique({
    where: {
      id: session.id
    }
  });
  const sessionId = customer?.session_id

  const countCandidates = await prisma.candidate.count();
  const { take, skip, totalItems, currentPage, totalPages, hasNextPage, hasPrevPage } = createPagination(Number(takeItem), Number(skipItem), countCandidates);

  const candidates = await prisma.candidate.findMany({
    where: {
      sessionSession_id: sessionId
    },
    take,
    skip
  })

  const result = {
    candidates,
    totalItems,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage
  }




  return new Response(JSON.stringify(result), {
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
  const submit = useSubmit();
  const resultData = useLoaderData<typeof loader>();
  const candidatesData = resultData.candidates as Candidate[];
  const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(candidatesData);
  const resourceName = {
    singular: 'candidate',
    plural: 'candidates',
  };

  const handleChangePage = React.useCallback(
    (direction: "prev" | "next") => {
      const { currentPage } = resultData;
      const newPage = direction === "next" ? currentPage + 1 : Math.max(1, currentPage - 1);

      submit({ page: newPage }, { method: "get" });
    },
    [resultData, submit]
  );

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
                hasNext: resultData.hasNextPage || false,
                hasPrevious: resultData.hasPrevPage || false,
                onNext: () => handleChangePage("next"),
                onPrevious: () => handleChangePage("prev"),
              }}
            >
              {rowMarkup}
            </IndexTable>
          </Card>
        </Layout.Section>
      </Layout>
      <Outlet />
    </Page>
  );
}