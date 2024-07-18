import { EmailTemplate } from "@/app/components/email-template";
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
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { sendToUser } from "../email/route";

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
            href: "/api/actions?amount=0.001&email={email}",
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
  }
};

export const OPTIONS = GET;

export const POST = async (request: Request) => {
  try {
    const requestUrl = new URL(request.url);
    // const sellerEmail = process.env.NEXT_PUBLIC_SELLER_EMAIL_ADDRESS;

    let amount: string | null = requestUrl.searchParams.get("amount");
    let email: string | null = requestUrl.searchParams.get("email");
    const sellerPubKey: string | undefined =
      process.env.NEXT_PUBLIC_SELLER_PUBLIC_KEY;
    try {
      if (!email || !amount) {
        throw "Email address is invalid";
      }
    } catch (error) {
      let errorMessage = "Something went wrong.";
      console.log("ERROR", error);
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
      throw "Invalid email.";
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
    }

    //CREATE TRANSACTION //
    try {
      let sellerKey: PublicKey;

      if (!sellerPubKey) {
        // console.log("SELLER", sellerKey);

        throw "Invalid seller address";
      }

      sellerKey = new PublicKey(sellerPubKey);
      const connection = new Connection(clusterApiUrl("devnet"), {
        commitment: "confirmed",
      });

      // CHECK USER BALANCE
      const userBalance = await connection.getBalance(userKey);
      const userBalanceInSol = userBalance / LAMPORTS_PER_SOL;
      // const lamportsToSol = 20 / LAMPORTS_PER_SOL;
      console.log("USERBALCNE", userBalanceInSol);

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
          return Response.json("Air Drop failed.", {
            status: 400,
            headers: ACTIONS_CORS_HEADERS,
          });
        }
      }

      const transaction = new Transaction();
      // if(!sellerKey) return;
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
        // const sellerPubKey = new PublicKey(sellerKey)
        const sellAccountBalance = await connection.getBalance(sellerKey);
        const sellAccountBalanceToSol = sellAccountBalance / LAMPORTS_PER_SOL;

        const senderEmail = process.env.NEXT_PUBLIC_SELLER_EMAIL_ADDRESS;
        const nodeMailerPassword = process.env.NEXT_PUBLIC_NODEMAILER_PASSWORD;
        // PRODUCT DETAILS
        const productName = "How to sell digital products using blinks!";
        const productLink = "/sell_digital_products_using_blinks.pdf";
        const senderName = "sellwithblinks";
        connection.onAccountChange(sellerKey, async (acc) => {
          const currentSellerAccountBalance = acc.lamports / LAMPORTS_PER_SOL;
          if (currentSellerAccountBalance > sellAccountBalanceToSol) {
            console.log("PAYMENT DONE BY", userKey.toString());
            // EMAIL FOR USER
            try {

              if(!senderName || !senderEmail) return;
              const sender = {
                name: senderName,
                address: senderEmail,
              };

             

              const messageTemplate = `<div style={{ padding: '8px' }}>
                                        <p>Hello,</p>
                                        <p>Thank you for purchasing <strong>${productName}</strong> </p>
                                        <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column' }}>
                                            <p style={{ fontFamily: 'monospace' }}>You can download your e-book here: 👇</p>
                                            <a href=${productLink} download style={{ margin: '4px auto' }}>
                                                <button style={{ backgroundColor: '#3b82f6', color: 'white', padding: '4px 8px' }}>Click here</button>
                                            </a>
                                        </div>
                                        <p>Thank you once again for your purchase!</p>
                                        <p>If you have any questions or need further assistance, reach us out at <strong>${senderEmail}</strong>.</p>
                                        <p>Best wishes,</p>
                                        <p>${senderName}</p>
                                    </div>
                                    `;

              const response = await sendToUser({sender, receipients: email,subject: productName, message: messageTemplate})
              console.log("RESPONSE ACCEPTED", response.accepted);
              console.log("RESPONSE REJECTED", response.rejected);

              return Response.json(response.accepted, {headers: ACTIONS_CORS_HEADERS})

            } catch (error) {
              Response.json("Failed to send ebook.", {
                status: 400,
                headers: ACTIONS_CORS_HEADERS,
              });
            }
            //EMAIL FOR SELLER
          }
        });
      } catch (error) {
        console.log("STATUS ERROR", error);
        let errorMessage = "Something went wrong.";
        console.log("ERROR", error);
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
      let errorMessage = "Something went wrong.";
      console.log("ERROR", error);
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
    let errorMessage = "Something went wrong.";
    if (typeof error == "string") {
      errorMessage = error;
      return new Response(errorMessage, {
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      });
    }
  }
};

function isValidEmail(email: string): boolean {
  // Define a regular expression for validating an Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
