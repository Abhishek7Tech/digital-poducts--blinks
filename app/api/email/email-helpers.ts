import Mail from "nodemailer/lib/mailer";

export type UserSendEmailDto = {
  from: Mail.Address;
  to: string;
  subject: string;
  html: string;
};

export function message(productName: string, senderName: string, productLink: string, senderEmail: string) {

     const messageTemplate = `<div style={{ padding: '8px' }}>
    <p>Hello,</p>
<p>Thank you for purchasing <strong>${productName}</strong> </p>
<div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column' }}>
<p style={{ fontFamily: 'monospace' }}>You can download your e-book here 👉: <a href=${productLink} download style={{ margin: '4px auto' }}>click here</a> </p>   
</div>
<p>Thank you once again for your purchase!</p>
<p>If you have any questions or need further assistance, reach us out at <strong>${senderEmail}</strong>.</p>
<p>Best wishes,</p>
<p>${senderName}</p>
</div>
`;

return messageTemplate;
}