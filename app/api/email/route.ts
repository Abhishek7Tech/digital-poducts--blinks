import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import Mail from "nodemailer/lib/mailer";

const transport = nodemailer.createTransport({
    host: process.env.NEXT_PUBLIC_MAILTRAP_HOST,
    port: 2525,
    auth: {
      user:process.env.NEXT_PUBLIC_MAILTRAP_AUTH_USER,
      pass:process.env.NEXT_PUBLIC_MAILTRAP_AUTH_PASSWORD
    }
  } as SMTPTransport.Options);

  type SendEmailDto = {
    sender: Mail.Address,
    receipients: string,
    subject: string,
    message: string
  }

export const sendToUser = async (dto: SendEmailDto) => {
    const {sender, receipients, subject, message} = dto;

    return await transport.sendMail({
      from: sender,
      to: receipients,
      subject,
      html: message,
    })
  }