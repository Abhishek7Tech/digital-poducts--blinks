import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import Mail from "nodemailer/lib/mailer";

const transport = nodemailer.createTransport({
  service: 'gmail',
    // host: process.env.NEXT_PUBLIC_MAILTRAP_HOST,
    // port: 2525,
    auth: {
      user:process.env.NEXT_PUBLIC_SELLER_EMAIL_ADDRESS,
      pass:process.env.NEXT_PUBLIC_NODEMAILER_PASSWORD
    }
  } as SMTPTransport.Options);

  type UserSendEmailDto = {
    sender: Mail.Address,
    receipients: string,
    subject: string,
    message: string
  }

export const sendToUser = async (dto: UserSendEmailDto) => {
    const {sender, receipients, subject, message} = dto;

    return await transport.sendMail({
      from: sender,
      to: receipients,
      subject,
      html: message,
    })
  }

  type SellerSendEmailDto = {
    sender: Mail.Address,
    receipient: string,
    subject: string,
    message: string
  }

  export const sendToSeller = async (dto: SellerSendEmailDto) => {
    const {sender, receipient, subject, message} = dto;

    return await transport.sendMail({
      from: sender,
      to: receipient,
      subject,
      html: message,
    })
  }