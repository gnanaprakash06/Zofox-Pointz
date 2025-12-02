// src/auth/google.ts
export function getGoogleAccessToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!(window as any).google || !import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      reject(
        new Error("Google Identity Services not loaded or CLIENT_ID missing")
      );
      return;
    }
    const client = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: "openid email profile",
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      callback: (resp: any) => {
        if (resp && resp.access_token) resolve(resp.access_token);
        else reject(new Error("No access_token from Google"));
      },
    });
    client.requestAccessToken();
  });
}
