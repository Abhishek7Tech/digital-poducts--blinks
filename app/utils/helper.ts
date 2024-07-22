import { ACTIONS_CORS_HEADERS } from "@solana/actions";
export function isValidEmail(email: string): boolean {
    // Define a regular expression for validating an Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

export function errorMessage(error: any) {
    let errorMessage = "Something went wrong.";
    if (typeof error == "string") {
      errorMessage = error;
      return Response.json(errorMessage, {
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      });
    }
  }

export function customErrorMessage(message: String) {
    return Response.json(message, {
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      });
}