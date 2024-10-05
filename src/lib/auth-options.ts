import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { AuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

async function refreshAccessToken(token: JWT): Promise<JWT> {
  console.log("REFRESHING TOKEN...");
  try {
    const response = await axios.get(
      "http://localhost:8000/api/user/refresh-token",
      {
        headers: {
          Authorization: `Bearer ${token.refreshToken}`,
        },
      }
    );
    if (response.status !== 200) {
      throw new Error("Soemthing went wrong");
    }
    const newTokens = response.data?.data;
    console.log("🚀 ~ refreshAccessToken ~ newTokens:", newTokens);

    return {
      ...token,
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    };
  } catch (error) {
    console.log("🚀 ~ refreshAccessToken ~ error:", error);
    return {
      ...token,
      error: "RefreshTokenError",
    };
  }
}

const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        try {
          const res = await axios.post(
            "http://localhost:8000/api/user/login",
            credentials
          );
          const user = res.data.data;
          if (!user) {
            throw new Error("No user returned");
          }
          return user;
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") {
        console.log("sign in using credentials");
        if (user.token) {
          return true;
        }
      }
      return false;
    },
    async jwt({ account, user, token }) {
      console.log("🚀 ~ jwt ~ token:", token);
      console.log("🚀 ~ jwt ~ account:", account);

      if (token?.accessToken) {
        const decodedToken = jwtDecode(token.accessToken);
        console.log("🚀 ~ jwt ~ decodedToken:", decodedToken);
        if (decodedToken?.exp) {
          token.expires_at = decodedToken.exp * 1000;
        }
      }
      if (user && account) {
        return {
          ...token,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          exp: Math.floor(Date.now() / 1000) + 3600,
          accessToken: user.token,
          refreshToken: user.refreshToken,
          user: {
            username: user.username,
          },
        };
      }

      if (token?.expires_at) {
        if (Date.now() < token.expires_at) {
          // token has not expired
          console.log("TOKEN HAS NOT EXPIRED");
          return token;
        }
      }
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken as string;
        // session.refreshToken = token.refreshToken as string;
        session.user = {
          ...session.user,
          ...token.user,
        };
      }
      return session;
    },
  },
};

export default authOptions;
