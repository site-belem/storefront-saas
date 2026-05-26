import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { SignJWT } from "jose";

const COOKIE_NAME = "session";
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
const SECRET = new TextEncoder().encode(ENV.cookieSecret);

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

function getRedirectUri(): string {
  // Use REDIRECT_URI from env, fallback to localhost for development
  return process.env.REDIRECT_URI || "http://localhost:3000";
}

function getGoogleAuthUrl(redirectUri: string): string {
  const state = Buffer.from(redirectUri).toString("base64");
  const callbackUrl = `${getRedirectUri()}/api/oauth/callback`;
  
  const params = new URLSearchParams({
    client_id: ENV.googleClientId,
    redirect_uri: callbackUrl,
    response_type: "code",
    scope: "profile email",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

async function exchangeCodeForGoogleToken(code: string) {
  const callbackUrl = `${getRedirectUri()}/api/oauth/callback`;
  
  const params = new URLSearchParams({
    client_id: ENV.googleClientId,
    client_secret: ENV.googleClientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: callbackUrl,
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange code for token");
  }

  return response.json();
}

async function getGoogleUserInfo(accessToken: string) {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get user info from Google");
  }

  return response.json();
}

async function createSessionToken(openId: string, options: { name: string; expiresInMs: number }) {
  const token = await new SignJWT({
    openId,
    name: options.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(new Date(Date.now() + options.expiresInMs))
    .sign(SECRET);

  return token;
}

export function registerOAuthRoutes(app: Express) {
  // Login route - redirect to Google
  app.get("/api/oauth/login", (req: Request, res: Response) => {
    const redirectUri = getQueryParam(req, "redirect") || "/";
    const authUrl = getGoogleAuthUrl(redirectUri);
    res.redirect(authUrl);
  });

  // Callback route - handle Google OAuth callback
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const redirectUri = Buffer.from(state, "base64").toString();

      // Exchange code for token
      const tokenData = await exchangeCodeForGoogleToken(code);
      const userInfo = await getGoogleUserInfo(tokenData.access_token);

      if (!userInfo.id) {
        res.status(400).json({ error: "id missing from user info" });
        return;
      }

      // Upsert user in database
      await db.upsertUser({
        openId: userInfo.id,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: "google",
        lastSignedIn: new Date(),
      });

      // Create session token
      const sessionToken = await createSessionToken(userInfo.id, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      // Set session cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Redirect to original URL or home
      res.redirect(302, redirectUri);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });

  // Logout route
  app.post("/api/oauth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.json({ success: true });
  });
}
