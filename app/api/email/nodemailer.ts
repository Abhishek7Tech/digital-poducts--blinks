import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import Mail from "nodemailer/lib/mailer";
import { ACTIONS_CORS_HEADERS } from "@solana/actions";

type UserSendEmailDto = {
  sender: Mail.Address;
  receipients: string;
  subject: string;
  message: string;
};

export const SendToUser = async (dto: UserSendEmailDto) => {
  const transport = nodemailer.createTransport({
  service:"gmail",
    // host: process.env.NEXT_PUBLIC_SMTP_HOST,
    // port: parseInt(process.env.NEXT_PUBLIC_SMTP_PORT || "465"),
    auth: {
      user: process.env.NEXT_PUBLIC_SELLER_EMAIL_ADDRESS,
      pass: process.env.NEXT_PUBLIC_NODEMAILER_PASSWORD,
    },
  } as SMTPTransport.Options);

  const { sender, receipients, subject, message } = dto;

  await new Promise((resolve, reject) => {
    // verify connection configuration
    transport.verify(function (error, success) {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        console.log("Server is ready to take our messages");
        resolve(success);
      }
    });
  }).then(async () => {
    await new Promise((resolve, reject) => {
      transport.sendMail(
        {
          from: sender,
          to: receipients,
          subject,
          html: message,
        },
        (err, info) => {
          if (err) {
            reject(err);
            return Response.json("Something went wrong", {headers: ACTIONS_CORS_HEADERS})

          } else {
            resolve(info);
            return Response.json("Delivered", {headers: ACTIONS_CORS_HEADERS})
          }
        }
      );
    });
  });
};

// type SellerSendEmailDto = {
//   sender: Mail.Address;
//   receipient: string;
//   subject: string;
//   message: string;
// };

// export const sendToSeller = async (dto: SellerSendEmailDto) => {
//   const { sender, receipient, subject, message } = dto;

//   return await transport.sendMail({
//     from: sender,
//     to: receipient,
//     subject,
//     html: message,
//   });
// };
