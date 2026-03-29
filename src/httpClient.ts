import { OAuth2Token } from "./tokens";
export type TokenState = OAuth2Token | Record<string, unknown> | null;

function toOAuth2Token(token: TokenState): OAuth2Token | null {
  if (token instanceof OAuth2Token) {
    return token;
  }

  if (
    token &&
    typeof token.accessToken === "string" &&
    typeof token.expiresAt === "number"
  ) {
    return new OAuth2Token(token.accessToken, token.expiresAt);
  }

  return null;
}

export class HttpClient {
  oauth2Token: TokenState = null;

  refreshOAuth2(): void {
    this.oauth2Token = new OAuth2Token("fresh-token", 10 ** 10);
  }

  request(
    method: string,
    path: string,
    opts?: { api?: boolean; headers?: Record<string, string> }
  ): { method: string; path: string; headers: Record<string, string> } {
    const api = opts?.api ?? false;
    const headers = opts?.headers ?? {};

    if (api) {
      const token = toOAuth2Token(this.oauth2Token);

      if (!token || token.expired) {
        this.refreshOAuth2();
      } else {
        this.oauth2Token = token;
      }

      if (this.oauth2Token instanceof OAuth2Token) {
        headers["Authorization"] = this.oauth2Token.asHeader();
      }
    }

    return { method, path, headers };
  }
}
