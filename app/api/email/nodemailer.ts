import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import Mail from "nodemailer/lib/mailer";
import { ACTIONS_CORS_HEADERS } from "@solana/actions";

export const createTransport = async () => {
  const transport = nodemailer.createTransport({
    service: "gmail",

    auth: {
      user: process.env.NEXT_PUBLIC_SELLER_EMAIL_ADDRESS,

      pass: process.env.NEXT_PUBLIC_NODEMAILER_PASSWORD,
    },
    tls: { rejectUnauthorized: false },
  } as SMTPTransport.Options);

  return transport;
};
