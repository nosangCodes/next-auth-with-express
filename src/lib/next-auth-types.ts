import "next-auth";

declare module "next-auth" {
  export interface User {
    username?: string;
    token?: string;
    refreshToken?: string;
  }

  export interface Session {
    accessToken?: string;
    refreshToken?: string;

    user: {
      username?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expires_at?: number;
    error?: "RefreshTokenError";
    user: {
      username?: string;
    };
  }
}
