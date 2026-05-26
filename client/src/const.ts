export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = (returnPath: string = "/") => {
  const redirect = `${window.location.origin}${returnPath}`;
  const state = btoa(redirect);
  const url = new URL(`${window.location.origin}/api/oauth/login`);
  url.searchParams.set("redirect", redirect);
  return url.toString();
};
