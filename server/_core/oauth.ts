import express, { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { SignJWT } from "jose";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

const SECRET = new TextEncoder().encode(ENV.cookieSecret);

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

function getRedirectUri(req: Request): string {
  // Detect the origin from the request header
  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost:3000";
  return `${protocol}://${host}`;
}

function getGoogleAuthUrl(req: Request, redirectUri: string): string {
  const state = Buffer.from(redirectUri).toString("base64");
  const baseUrl = getRedirectUri(req);
  const callbackUrl = `${baseUrl}/api/oauth/callback`;
  
  console.log("[OAuth] Generating auth URL");
  console.log("[OAuth] Base URL:", baseUrl);
  console.log("[OAuth] Callback URL:", callbackUrl);
  
  const params = new URLSearchParams({
    client_id: ENV.googleClientId,
    redirect_uri: callbackUrl,
    response_type: "code",
    scope: "profile email",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

async function exchangeCodeForGoogleToken(req: Request, code: string) {
  const baseUrl = getRedirectUri(req);
  const callbackUrl = `${baseUrl}/api/oauth/callback`;
  
  console.log("[OAuth] Exchanging code for token");
  console.log("[OAuth] Base URL:", baseUrl);
  console.log("[OAuth] Callback URL:", callbackUrl);
  console.log("[OAuth] Code:", code.substring(0, 20) + "...");
  
  const params = new URLSearchParams({
    client_id: ENV.googleClientId,
    client_secret: ENV.googleClientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: callbackUrl,
  });

  console.log("[OAuth] Sending token request to Google");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[OAuth] Token exchange failed:", response.status, errorText);
    throw new Error("Failed to exchange code for token");
  }

  console.log("[OAuth] Token exchange successful");
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

async function createSessionToken(openId: string, appId: string, options: { name: string; expiresInMs: number }) {
  const token = await new SignJWT({
    openId,
    appId,
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
    const authUrl = getGoogleAuthUrl(req, redirectUri);
    res.redirect(authUrl);
  });

  // Callback route - handle Google OAuth callback
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    console.log("[OAuth] Callback received");
    console.log("[OAuth] Has code:", !!code);
    console.log("[OAuth] Has state:", !!state);

    if (!code || !state) {
      console.error("[OAuth] Missing code or state");
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const redirectUri = Buffer.from(state, "base64").toString();
      console.log("[OAuth] Redirect URI from state:", redirectUri);

      // Exchange code for token
      const tokenData = await exchangeCodeForGoogleToken(req, code);
      const userInfo = await getGoogleUserInfo(tokenData.access_token);

      if (!userInfo.id) {
        console.error("[OAuth] No user ID in response");
        res.status(400).json({ error: "id missing from user info" });
        return;
      }

      console.log("[OAuth] User authenticated:", userInfo.id);

      // Upsert user in database
      await db.upsertUser({
        openId: userInfo.id,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: "google",
        lastSignedIn: new Date(),
      });

      // Create session token with appId
      const appId = ENV.appId || "storefront-saas";
      const sessionToken = await createSessionToken(userInfo.id, appId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      // Set session cookie with correct name
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      console.log("[OAuth] Session created with cookie:", COOKIE_NAME);
      console.log("[OAuth] Redirecting to:", redirectUri);

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
