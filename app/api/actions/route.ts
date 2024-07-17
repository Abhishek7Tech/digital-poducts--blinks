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
        connection.onAccountChange(sellerKey, (acc) => {
          const currentSellerAccountBalance = acc.lamports / LAMPORTS_PER_SOL;
          if (currentSellerAccountBalance > sellAccountBalanceToSol) {
            console.log("PAYMENT DONE BY", userKey.toString());
          }
        });
      } catch (error) {
        console.log("STATUS ERROR", error);
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
