import { OAuth2Client } from "google-auth-library";
import { ENV } from "./env";

const googleClient = new OAuth2Client(
  ENV.googleClientId,
  ENV.googleClientSecret,
  `${process.env.REDIRECT_URI || "http://localhost:3000"}/api/oauth/callback`
);

export function getGoogleAuthUrl(redirectUri: string): string {
  const state = Buffer.from(redirectUri).toString("base64");

  return googleClient.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "email"],
    state,
  });
}

export async function exchangeCodeForGoogleToken(code: string) {
  const { tokens } = await googleClient.getToken(code);
  return tokens;
}

export async function getGoogleUserInfo(accessToken: string) {
  const ticket = await googleClient.verifyIdToken({
    idToken: accessToken,
    audience: ENV.googleClientId,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error("Invalid token payload");
  }

  return {
    openId: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
  };
}

export async function getGoogleUserInfoFromAccessToken(accessToken: string) {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get user info from Google");
  }

  const data = await response.json();
  return {
    openId: data.id,
    email: data.email,
    name: data.name,
    picture: data.picture,
  };
}
