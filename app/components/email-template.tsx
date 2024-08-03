import * as React from "react";
import {
  Text,
  Link,
  Button,
  Html,
  Section,
  Head,
  Body
} from "@react-email/components";

interface EmailTemplateProps {
  productName: string;
  productLink: string;
  senderEmail: string;
  senderName: string;
}

export const Email: React.FC<EmailTemplateProps> = ({
  productName,
  productLink,
  senderEmail,
  senderName,
}) => (
    
  <Html>
    <Head />
    <Body>
      <Section className="p-2">
        <Text>Hello,</Text>
        <Text>
          Thank you for purchasing <strong>{productName}</strong>{" "}
        </Text>
        <Text className="px-4 py-2 flex flex-col font-mono">
          You can download your e-book below: 👇
        </Text>
        <Link href={productLink} download className="my-1 mx-auto">
          <Button className="bg-blue-500 text-white px-2 py-1">
            Click here
          </Button>
        </Link>
        <Text>Thank you once again for your purchase!</Text>
        <Text>
          If you have any questions or need further assistance, reach us out at{" "}
          <strong>{senderEmail}</strong>
        </Text>
        <Text>Best wishes,</Text>
        <Text>{senderName}</Text>
      </Section>
    </Body>
  </Html>
);
