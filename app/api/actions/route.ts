import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
} from "@solana/actions";
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { Email } from "@/app/components/email-template";
import { createTransport } from "@/app/api/email/nodemailer";
import { message, UserSendEmailDto } from "../email/email-helpers";
import {
  customErrorMessage,
  errorMessage,
  isValidEmail,
} from "@/app/utils/helper";
import Plunk from "@plunk/node";
import { render } from "@react-email/render";
import { headers } from "next/headers";
export const GET = async (request: Request) => {
  try {
    const requestURL = new URL(request.url);
    console.log("REQ", new URL(requestURL.origin).toString());
    const payload: ActionGetResponse = {
      title: "How to sell digital products with Solana Blinks.",
      icon: new URL("/cover.jpg", new URL(requestURL.origin)).toString(),
      description: "sell your digital products with blinks.",
      label: "Buy e-book.",
      links: {
        actions: [
          {
            label: "Buy e-book",
            href: "/api/actions?amount=0.100&email={email}",
            parameters: [
              {
                name: "email",
                label: "enter your email",
                required: true,
              },
            ],
          },
        ],
      },
    };
    return Response.json(payload, { headers: ACTIONS_CORS_HEADERS });
  } catch (error) {
    let errorMessage = "Something went wrong.";
    if (typeof error == "string") {
      errorMessage = error;
      return Response.json(errorMessage, {
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      });
    }
    // errorMessage(error);
  }
};

export const OPTIONS = GET;

export const POST = async (request: Request) => {
  try {
    const requestUrl = new URL(request.url);

    let amount: string | null = requestUrl.searchParams.get("amount");
    let email: string | null = requestUrl.searchParams.get("email");
    const sellerPubKey: string | undefined =
      process.env.NEXT_PUBLIC_SELLER_PUBLIC_KEY;
    try {
      if (!email || !amount) {
        return Response.json("Invalid address.", {
          status: 400,
          headers: ACTIONS_CORS_HEADERS,
        });
        // throw "Email address is invalid";
      }
    } catch (error) {
      // errorMessage(error);
      let errorMessage = "Something went wrong.";
      if (typeof error == "string") {
        errorMessage = error;
        return Response.json(errorMessage, {
          status: 400,
          headers: ACTIONS_CORS_HEADERS,
        });
      }
      return;
    }

    console.log("PASSED");
    //CHECK IF EMAIL IS VALID
    const isEmailValid = isValidEmail(email);

    if (!isEmailValid) {
      return Response.json("Invalid address.", {
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      });
      // throw "Invalid email.";
    }

    const requestBody: ActionPostRequest = await request.json();

    let userKey: PublicKey;
    // CHECK USER PUBLIC KEY
    try {
      userKey = new PublicKey(requestBody.account);
    } catch (error) {
      return Response.json("Invalid user address", {
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      });
      // return customErrorMessage("Invalid user address");
    }

    //CREATE TRANSACTION //
    try {
      let sellerKey: PublicKey;

      if (!sellerPubKey) {
        return Response.json("Invalid address.", {
          status: 400,
          headers: ACTIONS_CORS_HEADERS,
        });
        // throw "Invalid seller address";
      }

      sellerKey = new PublicKey(sellerPubKey);
      const connection = new Connection(clusterApiUrl("devnet"), {
        commitment: "confirmed",
      });

      // CHECK USER BALANCE
      const userBalance = await connection.getBalance(userKey);
      const userBalanceInSol = userBalance / LAMPORTS_PER_SOL;

      if (userBalanceInSol < 1) {
        try {
          const signature = await connection.requestAirdrop(
            userKey,
            LAMPORTS_PER_SOL
          );
          await connection.confirmTransaction(signature);

          const userBalance = await connection.getBalance(userKey);
          console.log("BALANCE AFTER AIRDROP", userBalance / LAMPORTS_PER_SOL);
        } catch (error) {
          return Response.json("Air drop failed", {
            status: 400,
            headers: ACTIONS_CORS_HEADERS,
          });
        }
      }

      const transaction = new Transaction();
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: userKey,
          toPubkey: sellerKey,
          lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
        })
      );

      transaction.feePayer = userKey;

      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;

      const payload: ActionPostResponse = await createPostResponse({
        fields: {
          transaction,
          message: "Thanks for the purchase! Please check your email.",
        },
      });
      try {
        const sellAccountBalance = await connection.getBalance(sellerKey);
        const sellAccountBalanceToSol = sellAccountBalance / LAMPORTS_PER_SOL;

        const senderEmail = process.env.NEXT_PUBLIC_SELLER_EMAIL_ADDRESS;
        // PRODUCT DETAILS
        const productName = "How sell digital products using Blinks!";
        const productLink =
          "https://drive.google.com/file/d/1hmU_WTEgWe8_JT_8q-OTg3QkXTIRCJ8H/view?usp=drivesdk";
        const senderName = "sellwithblinks";
        connection.onAccountChange(sellerKey, async (acc) => {
          const currentSellerAccountBalance = acc.lamports / LAMPORTS_PER_SOL;
          if (currentSellerAccountBalance > sellAccountBalanceToSol) {
            console.log("PAYMENT DONE BY", userKey.toString());
            // EMAIL FOR USER
            try {
              if (
                !senderName ||
                !senderEmail ||
                !process.env.NEXT_PUBLIC_PLUNK_API_KEY
              ) {
                return Response.json("Invalid credentials", {
                  status: 400,
                  headers: ACTIONS_CORS_HEADERS,
                });
              }

              const message = `<p>Hello,</p>
              <p>Thank you for purchasing <strong> ${productName}</strong></p>
              <p>You can download your e-book here 👉: <a style="color: blue" href=${productLink}>Click here</a></p>
              <p>Thank you once again for your purchase!</p>
              <p>If you have any questions or need further assistance, reach us out at <strong>sellwithblinks@gmail.com</strong></p>
              <p>Best wishes,</p>
              <p>sellwithblinks</p>`;
              // const plunk = new Plunk()
              const options = {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_PLUNK_API_KEY}`,
                },
                body: JSON.stringify({
                  to: email,
                  subject: "How to sell digital products using Blinks!",
                  body: message,
                }),
              };

              try {
                
                fetch("https://api.useplunk.com/v1/send", options)
                  .then((response) => response.json())
                  .then((response) => {
                    if (response.success) {
                      console.log("RESPONSE", response);
                      return Response.json(response, {
                        headers: ACTIONS_CORS_HEADERS,
                      });
                    }
                  });
              } catch (error) {
                return Response.json("Falied to send ebook.", {
                  status: 400,
                  headers: ACTIONS_CORS_HEADERS,
                });
              }
              // const body =
              // const sender = {
              //   name: senderName,
              //   address: senderEmail,
              // };

              // const messageTemplate = message(
              //   productName,
              //   senderName,
              //   productLink,
              //   senderEmail
              // );

              // const sendToUser = async (mailOptions: UserSendEmailDto) => {
              //   const emailTransporter = await createTransport();
              //   await emailTransporter.sendMail(mailOptions);
              // };

              // switch (request.method) {
              //   case "POST":
              //     sendToUser({
              //       from: sender,
              //       to: email,
              //       subject: productName,
              //       html: messageTemplate,
              //     })
              //       .then((result) =>
              //         Response.json(result, { headers: ACTIONS_CORS_HEADERS })
              //       )
              //       .catch((error) =>
              //         Response.json(error.message, {
              //           headers: ACTIONS_CORS_HEADERS,
              //         })
              //       );
              //     break;
              //   default:
              //     Response.json(405, { headers: ACTIONS_CORS_HEADERS }); //Method Not Allowed
              //     break;
              // }
            } catch (error) {
              return Response.json("Falied to send ebook.", {
                status: 400,
                headers: ACTIONS_CORS_HEADERS,
              });
              return customErrorMessage("Falied to send ebook.");
            }
            //EMAIL FOR SELLER
          } else {
            return Response.json("No pay", {
              status: 400,
              headers: ACTIONS_CORS_HEADERS,
            });
          }
        });
      } catch (error) {
        // errorMessage(error);
        let errorMessage = "Something went wrong.";
        if (typeof error == "string") {
          errorMessage = error;
          return Response.json(errorMessage, {
            status: 400,
            headers: ACTIONS_CORS_HEADERS,
          });
        }
      }
      return Response.json(payload, { headers: ACTIONS_CORS_HEADERS });
    } catch (error) {
      // errorMessage(error);
      let errorMessage = "Something went wrong.";
      if (typeof error == "string") {
        errorMessage = error;
        return Response.json(errorMessage, {
          status: 400,
          headers: ACTIONS_CORS_HEADERS,
        });
      }
    }

    console.log(requestBody.account, requestUrl, amount, email);
  } catch (error) {
    // errorMessage(error);
    let errorMessage = "Something went wrong.";
    if (typeof error == "string") {
      errorMessage = error;
      return Response.json(errorMessage, {
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      });
    }
  }
};
