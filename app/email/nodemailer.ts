import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import Mail from "nodemailer/lib/mailer";

const transport = nodemailer.createTransport({
  service: "gmail",
  host: process.env.NEXT_PUBLIC_MAILTRAP_HOST,
  port: 2525,
  auth: {
    user: process.env.NEXT_PUBLIC_SELLER_EMAIL_ADDRESS,
    pass: process.env.NEXT_PUBLIC_NODEMAILER_PASSWORD,
  },
} as SMTPTransport.Options);

type UserSendEmailDto = {
  sender: Mail.Address;
  receipients: string;
  subject: string;
  message: string;
};

export const SendToUser = async (dto: UserSendEmailDto) => {
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
          } else {
            resolve(info);
          }
        }
      );
    });

  })


  
};

type SellerSendEmailDto = {
  sender: Mail.Address;
  receipient: string;
  subject: string;
  message: string;
};

export const sendToSeller = async (dto: SellerSendEmailDto) => {
  const { sender, receipient, subject, message } = dto;

  return await transport.sendMail({
    from: sender,
    to: receipient,
    subject,
    html: message,
  });
};
