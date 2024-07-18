import * as React from "react";

interface EmailTemplateProps {
    productName: string,
    productLink: string,
    senderEmail: string,
    senderName: string
}


export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
    productName,
    productLink,
    senderEmail,
    senderName,
}) => (
    <div className="p-2">
        <p>Hello,</p>
        <p>Thank you for purchasing <strong>{productName}</strong> </p>
        <div className="px-4 py-2 flex flex-col">
            <p className="font-mono">You can download your e-book below: 👇</p>
            <a href={productLink} download className="my-1 mx-auto"><button className="bg-blue-500 text-white px-2 py-1">Click here</button></a>
        </div>
        <p>Thank you once again for your purchase!</p>
        <p>If you have any questions or need further assistance, reach us out at <strong>{senderEmail}</strong></p>
        <p>Best wishes,</p>
        <p>{senderName}</p>
    </div>
)