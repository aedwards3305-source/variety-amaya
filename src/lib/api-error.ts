/**
 * Pull the server's own error message out of a failed admin API response so the
 * admin sees what actually went wrong instead of a generic "please try again".
 */
export async function apiErrorMessage(res: Response, fallback: string): Promise<string> {
  if (res.status === 401) {
    return "Your admin session has expired. Go back to the admin login and sign in again.";
  }
  try {
    const data = await res.json();
    if (typeof data?.error === "string" && data.error) return data.error;
  } catch {
    // Response had no JSON body (e.g. a crashed function returning HTML)
  }
  return fallback;
}
