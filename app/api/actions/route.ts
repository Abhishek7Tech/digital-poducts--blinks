import { ActionGetResponse, ActionPostRequest, ActionPostResponse, ACTIONS_CORS_HEADERS } from "@solana/actions";
import { headers } from "next/headers";
export const GET = async (request: Request) => {
  try {
    const requestURL = new URL(request.url);
    console.log("REQ",  new URL(requestURL.origin).toString());
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
      return new Response(errorMessage, {
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
        
        let amount:String | null = requestUrl.searchParams.get("amount");; 
        let email: String | null = requestUrl.searchParams.get("email");;

        const requestBody: ActionPostRequest = await request.json();
        console.log(requestBody.account, requestUrl, amount, email);

        const payload: ActionPostResponse = {
          transaction: requestBody.account,
          message: "Sucess"
          
        }
        return Response.json( payload, {headers: ACTIONS_CORS_HEADERS})
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
}