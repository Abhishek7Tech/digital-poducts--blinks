import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
} from "@solana/actions";
import { PublicKey } from "@solana/web3.js";
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
    const sellerPubKey: string | undefined = process.env.NEXT_PUBLIC_SELLER_PUBLIC_KEY;
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

    console.log("PASSED")
    //CHECK IF EMAIL IS VALID
    const isEmailValid = isValidEmail(email);

    if(!isEmailValid) {
      throw "Invalid email."
    }

    const requestBody: ActionPostRequest = await request.json();

    let userKey: PublicKey;
    // CHECK USER PUBLIC KEY
    try {
      userKey = new PublicKey(requestBody.account);
      
    } catch (error) {
      return Response.json("Invalid user address", {
        status: 400,
        headers: ACTIONS_CORS_HEADERS
      })
    }

    let sellerKey: PublicKey;

    // CHECK SELLER PUB KEY
    
    try {
      if(sellerPubKey) {
        sellerKey = new PublicKey(sellerPubKey);
      }else {
        throw "Invalid seller address"
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
    
    console.log("SELLER PUB KEY", sellerPubKey);

    //CREATE TRANSACTION //

    console.log(requestBody.account, requestUrl, amount, email);

    const payload: ActionPostResponse = {
      transaction: requestBody.account,
      message: "Thanks for the purchase! Please check your email.",
    };

    return Response.json(payload, { headers: ACTIONS_CORS_HEADERS });
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
