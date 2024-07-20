import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import Mail from "nodemailer/lib/mailer";
import { ACTIONS_CORS_HEADERS } from "@solana/actions";
// import {google} from "googleapis";
// const { google } = require("googleapis");
// type UserSendEmailDto = {
//   sender: Mail.Address;
//   receipients: string;
//   subject: string;
//   message: string;
// };

// const OAuth2 =  google.auth.OAuth2;

export const createTransport = async () => {
  // const { sender, receipients, subject, message } = dto;
  // console.log("SENDER", sender, "REC", receipients);
  
  // console.log("ID", process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID, "SECRET", process.env.NEXT_PUBLIC_OAUTH_CLIENT_SECRET, "REFRESH",process.env.NEXT_PUBLIC_OAUTH_REFRESH_TOKEN )
  // const ouaht2Client = new OAuth2(
  //   process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID,
  //   process.env.NEXT_PUBLIC_OAUTH_CLIENT_SECRET,
  //   process.env.NEXT_PUBLIC_OAUTH_URL
  // );

  // ouaht2Client.setCredentials({
  //   refresh_token: process.env.NEXT_PUBLIC_OAUTH_REFRESH_TOKEN,
  // });

  // const accessToken = await new Promise((resolve, reject) => {
  //   ouaht2Client.getAccessToken((error: any, token: unknown) => {
  //     if (error) {
  //       console.log(error);
  //       reject(error);
  //     } else {
  //       console.log("Server is ready to take our messages");
  //       resolve(token);
  //     }
  //   })
  // })

  const transport = nodemailer.createTransport({
    service: "gmail",
    // port: parseInt(process.env.NEXT_PUBLIC_SMTP_PORT || "465"),
    // host: process.env.NEXT_PUBLIC_SMTP_HOST,
    auth: {
      // type: "OAuth2",
      user: process.env.NEXT_PUBLIC_SELLER_EMAIL_ADDRESS,
      // accessToken,
      // clientId: process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID,
      // clientSecret: process.env.NEXT_PUBLIC_OAUTH_CLIENT_SECRET,
      // refreshToken: process.env.NEXT_PUBLIC_OAUTH_REFRESH_TOKEN
      pass: process.env.NEXT_PUBLIC_NODEMAILER_PASSWORD,
    },
    tls: {rejectUnauthorized: false}
    // secure: true,
  } as SMTPTransport.Options);

  return transport;

  // await new Promise((resolve, reject) => {
  //   // verify connection configuration
  //   transport.verify(function (error, success) {
  //     if (error) {
  //       console.log(error);
  //       reject(error);
  //     } else {
  //       console.log("Server is ready to take our messages");
  //       resolve(success);
  //     }
  //   });
  // }).then(async () => {
  //   await new Promise((resolve, reject) => {
  //     transport.sendMail(
  //       {
  //         from: sender,
  //         to: receipients,
  //         subject,
  //         html: message,
  //       },
  //       (err, info) => {
  //         if (err) {
  //           reject(err);
  //           return Response.json("Something went wrong", {
  //             headers: ACTIONS_CORS_HEADERS,
  //           });
  //         } else {
  //           resolve(info);
  //           console.log("RESOLVED", info);
  //           return Response.json("Delivered", {
  //             headers: ACTIONS_CORS_HEADERS,
  //           });
  //         }
  //       }
  //     );
  //   });
  // });
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
