import { useState, useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  TextField,
  FormLayout,
  Banner,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import connectToDatabase from "../mongodb.server";
import { AuditLog } from "../models/AuditLog.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  // Fetch the current shop metafield value
  const response = await admin.graphql(
    `#graphql
    query getShopMetafield {
      shop {
        id
        metafield(namespace: "my_app", key: "announcement") {
          value
        }
      }
    }`
  );

  const responseJson = await response.json();
  const shopId = responseJson.data.shop.id;
  const currentAnnouncement = responseJson.data.shop.metafield?.value || "";

  return { currentAnnouncement, shopId };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const announcementText = formData.get("announcementText") as string;
  const shopId = formData.get("shopId") as string;

  if (!announcementText) {
    return { error: "Announcement text is required" };
  }

  // 1. Save to MongoDB (Audit History)
  await connectToDatabase();
  await AuditLog.create({
    shop: session.shop,
    announcementText,
    timestamp: new Date(),
  });

  // 2. Sync to Shopify (Metafields)
  const response = await admin.graphql(
    `#graphql
    mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
          value
        }
        userErrors {
          field
          message
        }
      }
    }`,
    {
      variables: {
        metafields: [
          {
            namespace: "my_app",
            key: "announcement",
            type: "single_line_text_field",
            value: announcementText,
            ownerId: shopId,
          },
        ],
      },
    }
  );

  const responseJson = await response.json();

  if (responseJson.data.metafieldsSet.userErrors.length > 0) {
    return { error: responseJson.data.metafieldsSet.userErrors[0].message };
  }

  return { success: true, updatedValue: announcementText };
};

export default function Index() {
  const { currentAnnouncement, shopId } = useLoaderData<typeof loader>();
  const [announcementText, setAnnouncementText] = useState(currentAnnouncement);
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();

  const isLoading = fetcher.state === "submitting";
  const data = fetcher.data as { success?: boolean; error?: string } | undefined;
  const isSuccess = data?.success;
  const error = data?.error;

  useEffect(() => {
    if (isSuccess) {
      shopify.toast.show("Announcement saved and synced!");
    }
  }, [isSuccess, shopify]);

  const handleSave = () => {
    fetcher.submit(
      { announcementText, shopId },
      { method: "POST" }
    );
  };

  return (
    <Page>
      <TitleBar title="Announcement Bar Dashboard" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <Text as="h2" variant="headingMd">
                  Manage Storefront Announcement
                </Text>
                <Text variant="bodyMd" as="p">
                  Change the text below and click "Save" to update the banner on your storefront.
                  Every change is tracked in our audit history.
                </Text>

                {error && (
                  <Banner tone="critical">
                    <p>{error}</p>
                  </Banner>
                )}

                <FormLayout>
                  <TextField
                    label="Announcement Text"
                    value={announcementText}
                    onChange={(value) => setAnnouncementText(value)}
                    autoComplete="off"
                    placeholder="Enter announcement text (e.g. Sale 50% Off!)"
                    helpText="This text will appear in the floating banner on your storefront."
                  />
                  <Button
                    variant="primary"
                    loading={isLoading}
                    onClick={handleSave}
                  >
                    Save
                  </Button>
                </FormLayout>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  How it works
                </Text>
                <Text variant="bodyMd" as="p">
                  1. <b>Admin</b>: You enter the text here.
                </Text>
                <Text variant="bodyMd" as="p">
                  2. <b>Database</b>: We save his record to MongoDB for auditing.
                </Text>
                <Text variant="bodyMd" as="p">
                  3. <b>Shopify API</b>: We sync the text to your Shop Metafields.
                </Text>
                <Text variant="bodyMd" as="p">
                  4. <b>Storefront</b>: The App Embed Block reads the metafield and displays it.
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
